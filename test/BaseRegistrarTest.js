const ENS = artifacts.require('ENSRegistry');
const BaseRegistrar = artifacts.require('BaseRegistrarImplementation');

const namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3;
const toBN = require('web3-utils').toBN;

const { evm, exceptions } = require("./test-utils");


const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

contract('BaseRegistrarImplementation', function (accounts) {
	const ownerAccount = accounts[0];
	const controllerAccount = accounts[1];
	const registrantAccount = accounts[2];
	const otherAccount = accounts[3];

	let ens;
	let registrar;

	before(async () => {
		ens = await ENS.deployed();
		registrar = await BaseRegistrar.deployed();

		registrar.addController(controllerAccount);
	});

	it('should allow new registrations', async () => {
		var tx = await registrar.register(sha3("newname"), registrantAccount, {from: controllerAccount});
		assert.equal(await ens.owner(namehash.hash("newname.theta")), registrantAccount);
		assert.equal(await registrar.ownerOf(sha3("newname")), registrantAccount);
	});

	it('should allow registrations without updating the registry', async () => {
		var tx = await registrar.registerOnly(sha3("silentname"), registrantAccount, {from: controllerAccount});
		var block = await web3.eth.getBlock(tx.receipt.blockHash);
		assert.equal(await ens.owner(namehash.hash("silentname.theta")), ZERO_ADDRESS);
		assert.equal(await registrar.ownerOf(sha3("silentname")), registrantAccount);
	});

	it('should only allow the controller to register', async () => {
		await exceptions.expectFailure(registrar.register(sha3("foo"), otherAccount, {from: otherAccount}));
	});

	it('should not permit registration of already registered names', async () => {
		await exceptions.expectFailure(registrar.register(sha3("newname"), otherAccount, {from: controllerAccount}));
		assert.equal(await registrar.ownerOf(sha3("newname")), registrantAccount);
	});

	it('should permit the owner to reclaim a name', async () => {
		await ens.setSubnodeOwner(ZERO_HASH, sha3("theta"), accounts[0]);
		await ens.setSubnodeOwner(namehash.hash("theta"), sha3("newname"), ZERO_ADDRESS);
		assert.equal(await ens.owner(namehash.hash("newname.theta")), ZERO_ADDRESS);
		await ens.setSubnodeOwner(ZERO_HASH, sha3("theta"), registrar.address);
		await registrar.reclaim(sha3("newname"), registrantAccount, {from: registrantAccount});
		assert.equal(await ens.owner(namehash.hash("newname.theta")), registrantAccount);
	});

	it('should prohibit anyone else from reclaiming a name', async () => {
		await exceptions.expectFailure(registrar.reclaim(sha3("newname"), registrantAccount, {from: otherAccount}));
	});

	it('should permit the owner to transfer a registration', async () => {
		await registrar.transferFrom(registrantAccount, otherAccount, sha3("newname"), {from: registrantAccount});
		assert.equal((await registrar.ownerOf(sha3("newname"))), otherAccount);
		// Transfer does not update ENS without a call to reclaim.
		assert.equal(await ens.owner(namehash.hash("newname.theta")), registrantAccount);
		await registrar.transferFrom(otherAccount, registrantAccount, sha3("newname"), {from: otherAccount});
	});

	it('should prohibit anyone else from transferring a registration', async () => {
		await exceptions.expectFailure(registrar.transferFrom(otherAccount, otherAccount, sha3("newname"), {from: otherAccount}));
	});

	it('should allow the owner to set a resolver address', async () => {
		await registrar.setResolver(accounts[1], {from: ownerAccount});
		assert.equal(await ens.resolver(namehash.hash("theta")), accounts[1]);
	});
});
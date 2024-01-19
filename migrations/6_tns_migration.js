const namehash = require("eth-ens-namehash");
const ENSRegistry = artifacts.require("ENSRegistry");
const BaseRegistrarImplementation = artifacts.require("BaseRegistrarImplementation");
const PublicResolver = artifacts.require("PublicResolver");
let tnsToTransfer = require('../tns-to-migrate.json');
let lastTnsToTransfer = require('../last-tns-to-transfer.json');

module.exports = async function (deployer, network, accounts) {
  const ENSRegistryInstance = await ENSRegistry.deployed();
  const BaseRegistrarImplementationInstance = await BaseRegistrarImplementation.deployed();
  const PublicResolverInstance = await PublicResolver.deployed();

  // Define a function to perform a single domain transfer
  async function transferDomain(domain) {
    //check if record name contains an _
    if (domain.name.includes("_")) {
      // Return the result or success message
      return `SKIPPED domain: ${domain.name}`;
    }

    const domainName = `${domain.name.replace('.theta', '')}.theta`;
    const label = namehash.hash(domainName);
    //Set Address Record
    // console.log("address record change", domain.name);
    // await PublicResolverInstance.setAddr(label, domain.owner);

    //Set Controller
    console.log("controller change", domain.name);
    await ENSRegistryInstance.setOwner(label, domain.owner);

    //Set Registrant
    console.log("registrant change", domain.name);
    await BaseRegistrarImplementationInstance.transferFrom(accounts[0], domain.owner, domain.tokenId);

    
    // Return the result or success message
    return `Transferred domain: ${domain.name}`;
  }

  // Set the desired number of transactions per block (e.g., 10)
  const transactionsPerBlock = 1;

  for (let i = 0; i < lastTnsToTransfer.length; i += transactionsPerBlock) {
    try {
      console.log(i);
      const tnsToTransferName = lastTnsToTransfer[i];
      console.log(tnsToTransferName)
      // const batch = tnsToTransfer.slice(i, i + transactionsPerBlock);
      const transfer = tnsToTransfer.find((x) => x.name === tnsToTransferName);
      console.log(transfer);
      // Use Promise.all to concurrently process a batch of domain transfers
      const transferPromises = [transfer].map(transferDomain);

      const results = await Promise.all(transferPromises);
      results.forEach(result => console.log(result));
    } catch (error) {
      console.log(i);
      console.error(error);
      throw "One or more domain transfers failed.";
    }

    // Add a delay between batches to control the number of transactions per block
    if (i + transactionsPerBlock < lastTnsToTransfer.length) {
      const delayMilliseconds = 10; // 20 seconds (adjust as needed)
      console.log(`Waiting for ${delayMilliseconds} milliseconds before the next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayMilliseconds));
    }
  }
};

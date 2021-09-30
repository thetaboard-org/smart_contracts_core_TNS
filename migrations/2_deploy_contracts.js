
const namehash = require("eth-ens-namehash");
const sha3 = require("web3-utils").sha3;

const ENSRegistry = artifacts.require("ENSRegistry");
const BaseRegistrarImplementation = artifacts.require("BaseRegistrarImplementation");
const TfuelPriceOracle = artifacts.require("TfuelPriceOracle");
const PublicResolver = artifacts.require("PublicResolver");
const ETHRegistrarController = artifacts.require("ETHRegistrarController");
const ReverseRegistrar = artifacts.require("ReverseRegistrar");

module.exports = async function (deployer, network, accounts) {
  // deploy ENSRegistry
  await deployer.deploy(ENSRegistry);
  const ENSRegistryInstance = await ENSRegistry.deployed();
  const ENSRegistryInstanceAddress = ENSRegistryInstance.address;
  
  // deploy BaseRegistrarImplementation
  await deployer.deploy(BaseRegistrarImplementation, ENSRegistryInstanceAddress, namehash.hash("theta"));
  const BaseRegistrarImplementationInstance = await BaseRegistrarImplementation.deployed();
  const BaseRegistrarImplementationInstanceAddress = BaseRegistrarImplementationInstance.address;

  // add controller to BaseRegistrarImplementation
  await BaseRegistrarImplementationInstance.addController(accounts[0]); // comment this when deploy to mainnet
  // set subnode owner to ENSRegistry
  await ENSRegistryInstance.setSubnodeOwner('0x0', sha3("theta"), BaseRegistrarImplementationInstanceAddress);
  
  // deploy TFuelPriceOracle
  await deployer.deploy(TfuelPriceOracle, [0, 0, 100, 50, 30]);
  const TfuelPriceOracleInstance = await TfuelPriceOracle.deployed();
  const TfuelPriceOracleInstanceAddress = TfuelPriceOracleInstance.address;

  // deploy PublicResolver
  await deployer.deploy(PublicResolver, ENSRegistryInstanceAddress);
  const PublicResolverInstance = await PublicResolver.deployed();
  const PublicResolverInstanceAddress = PublicResolverInstance.address;

  // deploy ETHRegistrarController
  await deployer.deploy(ETHRegistrarController, BaseRegistrarImplementationInstanceAddress, TfuelPriceOracleInstanceAddress, 60, 86400);
  const ETHRegistrarControllerInstance = await ETHRegistrarController.deployed();
  const ETHRegistrarControllerInstanceAddress = ETHRegistrarControllerInstance.address;

  // add controller to ENSRegistry
  await BaseRegistrarImplementationInstance.addController(ETHRegistrarControllerInstanceAddress);

  // deploy ReverseRegistrar
  await deployer.deploy(ReverseRegistrar, ENSRegistryInstanceAddress, PublicResolverInstanceAddress);
};

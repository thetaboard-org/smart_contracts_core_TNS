
const namehash = require("eth-ens-namehash");
const sha3 = require("web3-utils").sha3;

const ENSRegistry = artifacts.require("ENSRegistry");
const BaseRegistrarImplementation = artifacts.require("BaseRegistrarImplementation");
const TfuelPriceOracle = artifacts.require("TfuelPriceOracle");
const PublicResolver = artifacts.require("PublicResolver");
const ETHRegistrarController = artifacts.require("ETHRegistrarController");
const ReverseRegistrar = artifacts.require("ReverseRegistrar");
/*const testNames = [
"alaskavacation"
,"amsterdamhotels"
,"anguillahotels"
,"anguillaresorts"
,"antiguahotels"
,"antiguaresorts"
,"arubaresorts"
,"athens"
,"australiahotels"
,"aviation"
,"balitravel"
,"balivilla"
,"bangkokhotels"
,"barbadoshotels"
,"barbadosresorts"
,"beijinghotels"
,"berlinhotel"
,"bestairlines"
,"biker"
,"boat"
,"boatdocks"
,"bus"
,"cabin"
,"canadahotels"
,"cancunhotels"
,"caribbeanvilla"
,"casinohotel"
,"caymanislandshotels"
,"caymanislandsresorts"
,"chinahotels"
,"continents"
,"coolplanet"
,"cottage"
,"country"
,"coupe"
,"curacaohotels"
,"curacaoresorts"
,"delhi"
,"discountedhotels"
,"east"
,"north"
,"ebike"
,"ecars"
,"ecocar"
,"ehotels"
,"englandhotels"
,"eurotour"
,"explore"
,"florencehotels"
,"floridarentals"
,"francetour"
,"gofar"
,"grenadahotels"
,"grenadaresorts"
,"grouphotels"
,"guadeloupehotels"
,"guadelouperesorts"
,"haul"
,"hawaiiancruise"
,"hawaiiancruises"
,"helicopter"
,"honeymoon"
,"hotelberlin"
,"hotelnewyork"
,"hotels"
,"hotelsbarcelona"
,"hotelsinlondon"
,"inn"
,"italytravel"
,"jamaicahotels"
,"japanguide"
,"jet24"
,"jetset"
,"koreatravel"
,"lisbonportugal"
,"lisbontravel"
,"lodges"
,"londonhotels"
,"luxuryvilla"
,"macauhotels"
,"madridhotels"
,"madridspain"
,"maldives"
,"maldiveshotels"
,"maui"
,"mauihawaii"
,"mauritiushotels"
,"mexicotravel"
,"miamihotels"
,"milanhotels"
,"minicar"
,"motel"
,"motors"
,"motorscooters"
,"newyorkcity"
,"ohana"
,"osakahotels"
,"parisfrance"
,"paristravel"
,"pickups"
,"plane"
,"portugalhotels"
,"portugalproperty"
,"praguetravel"
,"rail"
,"ranch"
,"repair"
,"road"
,"roam"
,"rocket"
,"romehotels"
,"rooms"
,"scooter"
,"shipments"
]
*/
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
  // await BaseRegistrarImplementationInstance.addController(accounts[0]); // comment this when deploy to mainnet
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

  // deploy ReverseRegistrar
  await deployer.deploy(ReverseRegistrar, ENSRegistryInstanceAddress, PublicResolverInstanceAddress);
  const ReverseRegistrarInstance = await ReverseRegistrar.deployed();
  const ReverseRegistrarInstanceAddress = ReverseRegistrarInstance.address;

  await ENSRegistryInstance.setSubnodeOwner('0x0', sha3('reverse'), accounts[0], {
    from: accounts[0],
  });

  await ENSRegistryInstance.setSubnodeOwner(
    namehash.hash('reverse'),
    sha3('addr'),
    ReverseRegistrarInstanceAddress,
    { from: accounts[0] }
  );

  // deploy ETHRegistrarController
  await deployer.deploy(ETHRegistrarController, BaseRegistrarImplementationInstanceAddress, TfuelPriceOracleInstanceAddress, 60, 86400);
  const ETHRegistrarControllerInstance = await ETHRegistrarController.deployed();
  const ETHRegistrarControllerInstanceAddress = ETHRegistrarControllerInstance.address;

  // add controller to ENSRegistry
  await BaseRegistrarImplementationInstance.addController(ETHRegistrarControllerInstanceAddress);
    /*
  await TfuelPriceOracleInstance.setPrices([
    0,
    0, 
    ethers.util.parseEther("5"), 
    ethers.util.parseEther("3"), 
    ethers.util.parseEther("1")]);

  console.log("Before massDomainBuy");
  console.log(await web3.eth.getBalance(accounts[0]));
  const tx = await ETHRegistrarControllerInstance.massDomainBuy(testNames, accounts[0], PublicResolverInstanceAddress, accounts[0]);
  console.log(await web3.eth.getBalance(accounts[0]));
  console.log(tx);*/
}

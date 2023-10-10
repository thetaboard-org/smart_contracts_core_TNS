const domainsToBuy = require('../tns-to-transfer.json');

const TfuelPriceOracle = artifacts.require("TfuelPriceOracle");
const ETHRegistrarController = artifacts.require("ETHRegistrarController");
const PublicResolver = artifacts.require("PublicResolver");

module.exports = async function (deployer, network, accounts) {
  const TfuelPriceOracleInstance = await TfuelPriceOracle.deployed();
  
  
  const PublicResolverInstance = await PublicResolver.deployed();
  const PublicResolverInstanceAddress = PublicResolverInstance.address;

  const ETHRegistrarControllerInstance = await ETHRegistrarController.deployed();
  
  //Mass Buy
  await TfuelPriceOracleInstance.setPrices([
    0,
    0, 
    0, 
    0,
    0,
    0,
    0, 
    0]);

    let domainList = []
    let transactionsPerBlock = 40;
    let index = 0;
    // for await (const domain of domainsToBuy) {
    for (let i = index; i < domainsToBuy.length; i++) {
      try {
      console.log(i);
      domainList.push(domainsToBuy[i].name.toString());
      if (domainList.length > transactionsPerBlock) {
          await ETHRegistrarControllerInstance.massDomainBuy(domainList, accounts[0], PublicResolverInstanceAddress, accounts[0]);
          domainList = [];
        }
      } catch (e) {
        console.log(i);
        console.log(e);
        throw "mass buy stopped at: " + domainsToBuy[i].name
      }
    }

    await ETHRegistrarControllerInstance.massDomainBuy(domainList, accounts[0], PublicResolverInstanceAddress, accounts[0]);
}


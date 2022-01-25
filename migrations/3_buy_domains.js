const domainsToBuy = require('../domainsToBuy.json');

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
    0]);

    let domainList = [];
    for await (const domain of domainsToBuy.domains) {
      domainList.push(domain.toString());
      console.log("Pushing: " + domain.toString());
      if (domainList.length > 40) {
        try {
          console.log("Before mass buy");
          console.log(await web3.eth.getBalance(accounts[0]));
          await ETHRegistrarControllerInstance.massDomainBuy(domainList, accounts[0], PublicResolverInstanceAddress, accounts[0]);
          console.log("After mass buy");
          console.log(await web3.eth.getBalance(accounts[0]));
        } catch (e) {
          console.log(e);
          throw "mass buy stopped at: " + domain
        }
        domainList = [];
      }
    }

    console.log("Before mass buy");
    console.log(await web3.eth.getBalance(accounts[0]));
    await ETHRegistrarControllerInstance.massDomainBuy(domainList, accounts[0], PublicResolverInstanceAddress, accounts[0]);
    console.log("Final massDomainBuy DONE");
    console.log(await web3.eth.getBalance(accounts[0]));
}


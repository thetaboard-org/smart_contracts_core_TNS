const { ethers } = require("ethers");

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
    for (let i = index; i < domainList.length; i++) {
      try {
      console.log(i);
      if (domainList.length > transactionsPerBlock) {
          await ETHRegistrarControllerInstance.massDomainBuy(domainList, accounts[0], PublicResolverInstanceAddress, accounts[0]);
          domainList = [];
        }
      } catch (e) {
        console.log(i);
        console.log(e);
        throw "mass buy stopped at: " + domainList[i]
      }
    }

    await ETHRegistrarControllerInstance.massDomainBuy(domainList, accounts[0], PublicResolverInstanceAddress, accounts[0]);

    await TfuelPriceOracleInstance.setPrices([
      0,
      ethers.utils.parseEther("10000"),
      ethers.utils.parseEther("3000"),
      ethers.utils.parseEther("1500"),
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("750"),
      ethers.utils.parseEther("600"),
      ethers.utils.parseEther("500")]);  
}


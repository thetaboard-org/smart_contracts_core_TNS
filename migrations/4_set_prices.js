const { ethers } = require("ethers");
const TfuelPriceOracle = artifacts.require("TfuelPriceOracle");

module.exports = async function (deployer, network, accounts) {
  const TfuelPriceOracleInstance = await TfuelPriceOracle.deployed();
  await TfuelPriceOracleInstance.setPrices([
    0,
    ethers.utils.parseEther("10000"), 
    ethers.utils.parseEther("2500"), 
    ethers.utils.parseEther("1000"), 
    ethers.utils.parseEther("500"), 
    ethers.utils.parseEther("250"), 
    ethers.utils.parseEther("150"), 
    ethers.utils.parseEther("100")]);
}

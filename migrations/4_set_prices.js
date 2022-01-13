const { ethers } = require("ethers");
const TfuelPriceOracle = artifacts.require("TfuelPriceOracle");

module.exports = async function (deployer, network, accounts) {
  const TfuelPriceOracleInstance = await TfuelPriceOracle.deployed();
  await TfuelPriceOracleInstance.setPrices([
    0,
    0, 
    ethers.utils.parseEther("10"), 
    ethers.utils.parseEther("5"), 
    ethers.utils.parseEther("3")]);
}

const { ethers } = require("ethers");
const TfuelPriceOracle = artifacts.require("TfuelPriceOracle");

module.exports = async function (deployer, network, accounts) {
  const TfuelPriceOracleInstance = await TfuelPriceOracle.deployed();
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

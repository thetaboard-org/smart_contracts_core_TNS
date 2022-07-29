const { ethers } = require("ethers");
const ETHRegistrarController = artifacts.require("ETHRegistrarController");

module.exports = async function (deployer, network, accounts) {
  const ETHRegistrarControllerInstance = await ETHRegistrarController.deployed();
  await ETHRegistrarControllerInstance.withdraw();
}

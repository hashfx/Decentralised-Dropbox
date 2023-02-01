const DStorage = artifacts.require("src/contracts/DStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(DStorage);
};
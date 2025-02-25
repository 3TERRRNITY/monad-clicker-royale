const { ethers } = require("hardhat");

async function main() {
  const Clicker = await ethers.getContractFactory("Clicker");
  const contract = await Clicker.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

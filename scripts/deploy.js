
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying GrantChain contracts...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy GovernanceToken first
  console.log("\n1. Deploying GovernanceToken...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy();
  await governanceToken.waitForDeployment();
  console.log("GovernanceToken deployed to:", await governanceToken.getAddress());

  // Deploy GrantFactory
  console.log("\n2. Deploying GrantFactory...");
  const GrantFactory = await ethers.getContractFactory("GrantFactory");
  const grantFactory = await GrantFactory.deploy();
  await grantFactory.waitForDeployment();
  console.log("GrantFactory deployed to:", await grantFactory.getAddress());

  // Set up governance token in factory
  console.log("\n3. Setting up governance token in factory...");
  await grantFactory.setGovernanceToken(await governanceToken.getAddress());
  console.log("Governance token set in GrantFactory");

  // Transfer governance token ownership to factory
  console.log("\n4. Transferring governance token ownership...");
  await governanceToken.transferOwnership(await grantFactory.getAddress());
  console.log("Governance token ownership transferred to GrantFactory");

  console.log("\n=== Deployment Summary ===");
  console.log("GovernanceToken:", await governanceToken.getAddress());
  console.log("GrantFactory:", await grantFactory.getAddress());
  console.log("Network:", (await deployer.provider.getNetwork()).name);
  
  // Save deployment info
  const deploymentInfo = {
    network: (await deployer.provider.getNetwork()).name,
    governanceToken: await governanceToken.getAddress(),
    grantFactory: await grantFactory.getAddress(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };
  
  console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

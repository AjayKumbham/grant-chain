
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting Complete GrantChain Deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const network = await deployer.provider.getNetwork();
  
  console.log("📋 Deployment Details:");
  console.log("- Network:", network.name);
  console.log("- Chain ID:", network.chainId.toString());
  console.log("- Deployer:", deployer.address);
  console.log("- Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  if (await deployer.provider.getBalance(deployer.address) < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low balance. You may need more testnet ETH for deployment.");
  }

  let deploymentResults = {};
  
  try {
    // Step 1: Deploy GovernanceToken
    console.log("\n🪙 Step 1: Deploying GovernanceToken...");
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    const governanceToken = await GovernanceToken.deploy(deployer.address);
    await governanceToken.waitForDeployment();
    const governanceTokenAddress = await governanceToken.getAddress();
    
    console.log("✅ GovernanceToken deployed:", governanceTokenAddress);
    deploymentResults.governanceToken = governanceTokenAddress;

    // Step 2: Deploy GrantFactory
    console.log("\n🏭 Step 2: Deploying GrantFactory...");
    const GrantFactory = await ethers.getContractFactory("GrantFactory");
    const grantFactory = await GrantFactory.deploy();
    await grantFactory.waitForDeployment();
    const grantFactoryAddress = await grantFactory.getAddress();
    
    console.log("✅ GrantFactory deployed:", grantFactoryAddress);
    deploymentResults.grantFactory = grantFactoryAddress;

    // Step 3: Configure GovernanceToken permissions
    console.log("\n🔧 Step 3: Configuring permissions...");
    
    // Mint initial tokens to deployer for testing
    const mintTx = await governanceToken.mint(deployer.address, ethers.parseEther("10000"));
    await mintTx.wait();
    console.log("✅ Initial tokens minted to deployer");

    // Transfer ownership of governance token to grant factory for minting
    const tx1 = await governanceToken.transferOwnership(grantFactoryAddress);
    await tx1.wait();
    console.log("✅ Governance token ownership transferred to GrantFactory");

    // Step 4: Create test grant for demonstration
    console.log("\n🎯 Step 4: Creating test grant...");
    const testGrantAmount = ethers.parseEther("0.01"); // 0.01 ETH
    const createGrantTx = await grantFactory.createGrant(
      "Test Grant - DeFi Education Platform",
      testGrantAmount,
      3, // 3 milestones
      "QmTestHash123...", // IPFS hash placeholder
      7 * 24 * 60 * 60, // 7 days voting period
      { value: testGrantAmount }
    );
    const receipt = await createGrantTx.wait();
    
    // Get the created grant address from events
    const grantCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = grantFactory.interface.parseLog(log);
        return parsed.name === 'GrantCreated';
      } catch {
        return false;
      }
    });
    
    if (grantCreatedEvent) {
      const parsedEvent = grantFactory.interface.parseLog(grantCreatedEvent);
      deploymentResults.testGrantAddress = parsedEvent.args.grantAddress;
      console.log("✅ Test grant created:", deploymentResults.testGrantAddress);
    }

    // Step 5: Generate deployment summary
    const deploymentSummary = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      contracts: {
        governanceToken: governanceTokenAddress,
        grantFactory: grantFactoryAddress,
        ...(deploymentResults.testGrantAddress && { testGrant: deploymentResults.testGrantAddress })
      },
      transactionHashes: {
        governanceToken: governanceToken.deploymentTransaction()?.hash,
        grantFactory: grantFactory.deploymentTransaction()?.hash,
        testGrant: createGrantTx.hash
      }
    };

    // Save deployment info to file
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `${network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentSummary, null, 2));

    console.log(`\n4. Deployment info saved to: ${deploymentFile}`);

    return deploymentSummary;

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    throw error;
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n✅ Deployment script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment script failed:");
    console.error(error);
    process.exit(1);
  });
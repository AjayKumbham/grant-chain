
const { run } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const network = process.env.HARDHAT_NETWORK || 'sepolia';
  
  // Try to find the latest deployment file
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    console.error("No deployments directory found. Please deploy contracts first.");
    return;
  }

  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(file => file.startsWith(network) && file.endsWith('.json'))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    console.error(`No deployment files found for network: ${network}`);
    return;
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, deploymentFiles[0]), 'utf8')
  );

  console.log("🔍 Verifying contracts on Etherscan...");
  console.log("Network:", latestDeployment.network);

  try {
    // Verify GovernanceToken
    console.log("\n📋 Verifying GovernanceToken...");
    await run("verify:verify", {
      address: latestDeployment.contracts.governanceToken,
      constructorArguments: [],
    });
    console.log("✅ GovernanceToken verified");

    // Verify GrantFactory
    console.log("\n📋 Verifying GrantFactory...");
    await run("verify:verify", {
      address: latestDeployment.contracts.grantFactory,
      constructorArguments: [latestDeployment.contracts.governanceToken],
    });
    console.log("✅ GrantFactory verified");

    console.log("\n🎉 All contracts verified successfully!");
    
  } catch (error) {
    console.error("❌ Verification failed:");
    console.error(error);
  }
}

main().catch(console.error);

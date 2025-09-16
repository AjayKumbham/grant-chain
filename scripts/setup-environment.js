
const fs = require('fs');
const path = require('path');

async function setupEnvironment() {
  console.log("🔧 Setting up environment configuration...");

  const deploymentFiles = fs.readdirSync(path.join(__dirname, '..', 'deployments'))
    .filter(file => file.endsWith('.json'))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    console.error("No deployment files found. Please deploy contracts first.");
    return;
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'deployments', deploymentFiles[0]), 'utf8')
  );

  // Read the current .env.example
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envExample = fs.readFileSync(envExamplePath, 'utf8');

  // Update with actual contract addresses
  let updatedEnvExample = envExample
    .replace('VITE_GRANT_FACTORY_ADDRESS=', `VITE_GRANT_FACTORY_ADDRESS=${latestDeployment.contracts.grantFactory}`)
    .replace('VITE_GOVERNANCE_TOKEN_ADDRESS=', `VITE_GOVERNANCE_TOKEN_ADDRESS=${latestDeployment.contracts.governanceToken}`);

  // Write to .env.example
  fs.writeFileSync(envExamplePath, updatedEnvExample);

  // Create/update .env file
  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, updatedEnvExample);

  console.log("✅ Environment files updated with contract addresses");
  console.log("📋 Contract addresses:");
  console.log("- GrantFactory:", latestDeployment.contracts.grantFactory);
  console.log("- GovernanceToken:", latestDeployment.contracts.governanceToken);
}

setupEnvironment().catch(console.error);

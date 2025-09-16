
# GrantChain Setup Guide

This guide provides comprehensive, step-by-step instructions for setting up the GrantChain decentralized grant management platform.

## 📋 Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version && npm --version`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **MetaMask** or compatible Web3 wallet
   - Install [MetaMask browser extension](https://metamask.io/)
   - Create a new wallet or import existing one
   - **Important**: Keep your seed phrase secure and never share it

### Required API Keys & Services

You'll need accounts and API keys for the following services:

#### 1. Infura (Ethereum RPC Provider)
- Sign up at [infura.io](https://infura.io/)
- Create a new project
- Copy the Project ID from your dashboard
- Note: Free tier provides sufficient requests for development

#### 2. Etherscan (Contract Verification)
- Sign up at [etherscan.io](https://etherscan.io/)
- Go to [API Keys section](https://etherscan.io/apis)
- Create a new API key
- Note: Required for verifying deployed contracts

#### 3. WalletConnect (Multi-Wallet Support)
- Sign up at [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Create a new project
- Copy the Project ID
- Configure allowed domains (add localhost:8080 for development)

#### 4. Web3.Storage (IPFS Provider)
- Sign up at [web3.storage](https://web3.storage/)
- Create an API token in your account dashboard
- Note: Provides 1TB free storage for IPFS uploads

#### 5. Sepolia Testnet ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Request test ETH using your wallet address
- Alternative faucets: [Alchemy Faucet](https://sepoliafaucet.com/), [Chainlink Faucet](https://faucets.chain.link/)

## 🚀 Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd grantchain

# Verify you're in the correct directory
ls -la  # Should show package.json and other project files
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected output should include:**
- react@18.3.1
- hardhat@2.24.3
- @supabase/supabase-js
- wagmi
- And other dependencies

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Open the file for editing
# Use your preferred editor: nano, vim, vscode, etc.
nano .env
```

**Configure your `.env` file with the following values:**

```env
# Blockchain Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID
PRIVATE_KEY=your-wallet-private-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key

# IPFS Configuration
VITE_IPFS_API_KEY=your-web3-storage-api-key

# WalletConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Contract Addresses (will be updated after deployment)
VITE_GRANT_FACTORY_ADDRESS=
VITE_GOVERNANCE_TOKEN_ADDRESS=

# Supabase Configuration (already configured)
VITE_SUPABASE_URL=https://kdpfymrzterzijlbnxhd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcGZ5bXJ6dGVyemlqbGJueGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTgwNTIsImV4cCI6MjA2NTU5NDA1Mn0.T-uBBBx8Xm46Ycfsy_hPYmFZHVxdZ1bT0_Uw0nK8p-Q
```

### Step 4: Get Your Private Key

**⚠️ Security Warning: Never share your private key or commit it to version control**

#### From MetaMask:
1. Open MetaMask extension
2. Click on account menu (three dots)
3. Select "Account Details"
4. Click "Export Private Key"
5. Enter your MetaMask password
6. Copy the private key (64-character string starting with 0x)

#### Create a New Wallet (Recommended for Development):
```bash
# Generate a new wallet using Hardhat
npx hardhat run scripts/generate-wallet.js
```

### Step 5: MetaMask Network Setup

Add Sepolia testnet to MetaMask:

1. Open MetaMask
2. Click network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" or "Custom RPC"
4. Enter the following details:

```
Network Name: Sepolia Test Network
New RPC URL: https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer URL: https://sepolia.etherscan.io/
```

5. Click "Save"
6. Switch to Sepolia network

### Step 6: Acquire Test ETH

1. Copy your wallet address from MetaMask
2. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
3. Paste your address and request ETH
4. Wait for confirmation (usually 1-2 minutes)
5. Verify balance in MetaMask

**You'll need approximately:**
- 0.1 ETH for contract deployment
- 0.05 ETH for testing transactions
- Additional ETH for grant funding (test amounts)

## 🔧 Smart Contract Deployment

### Option 1: Deploy to Sepolia Testnet (Recommended)

```bash
# Compile contracts
npx hardhat compile

# Run tests to ensure everything works
npx hardhat test

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected output:**
```
Deploying contracts...
GovernanceToken deployed to: 0x...
GrantFactory deployed to: 0x...
Deployment completed!
```

### Option 2: Local Development (Optional)

```bash
# Start local Hardhat node (in separate terminal)
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Step 7: Update Contract Addresses

After successful deployment, update your `.env` file:

```env
# Copy addresses from deployment output
VITE_GRANT_FACTORY_ADDRESS=0x1234567890123456789012345678901234567890
VITE_GOVERNANCE_TOKEN_ADDRESS=0x0987654321098765432109876543210987654321
```

### Step 8: Verify Contracts (Optional)

```bash
# Verify GrantFactory contract
npx hardhat verify --network sepolia <GRANT_FACTORY_ADDRESS>

# Verify GovernanceToken contract
npx hardhat verify --network sepolia <GOVERNANCE_TOKEN_ADDRESS>
```

## 🖥️ Frontend Setup

### Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:8080
```

**If port 8080 is busy, Vite will automatically use the next available port (8081, 8082, etc.)**

### Verify Setup

1. **Open your browser** and navigate to `http://localhost:8080`
2. **Connect Wallet**: Click "Connect Wallet" in the top navigation
3. **Select MetaMask** and approve the connection
4. **Check Network**: Ensure you're connected to Sepolia testnet
5. **Test Features**: Try creating a test grant or browsing existing ones

## 🧪 Testing the Application

### Test Contract Interactions

```bash
# Run comprehensive tests
npm test

# Test specific functionality
npx hardhat test test/Grant.test.js
npx hardhat test test/GrantFactory.test.js
```

### Test Frontend Features

1. **Wallet Connection**
   - Click "Connect Wallet"
   - Approve connection in MetaMask
   - Verify wallet address appears in UI

2. **Grant Creation**
   - Navigate to "Create Grant"
   - Fill in grant details
   - Deploy grant contract (requires ETH)
   - Verify grant appears in grants list

3. **IPFS Upload**
   - Try uploading a file in any form
   - Verify file is stored on IPFS
   - Check browser console for IPFS hash

4. **Analytics Dashboard**
   - Visit `/analytics`
   - Verify charts and metrics load
   - Test export functionality

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot connect to wallet"
```bash
# Solutions:
# - Ensure MetaMask is installed and unlocked
# - Check that you're on the correct network (Sepolia)
# - Refresh the page and try again
```

#### 2. "Contract deployment failed"
```bash
# Check:
# - You have sufficient ETH for gas fees
# - Your private key is correct in .env
# - Infura RPC URL is working
# - Run: npx hardhat test to verify contracts compile
```

#### 3. "IPFS upload failed"
```bash
# Verify:
# - Web3.Storage API key is correct
# - Check network connectivity
# - Try uploading a smaller file first
```

#### 4. "Environment variables not loading"
```bash
# Solutions:
# - Ensure .env file is in project root
# - Restart development server: npm run dev
# - Check .env syntax (no spaces around =)
```

#### 5. "Database connection error"
```bash
# The Supabase instance is pre-configured
# If issues persist, check:
# - Internet connectivity
# - Browser console for specific errors
```

### Getting More Help

#### Check Logs and Console

1. **Browser Console**: Open Developer Tools (F12) → Console tab
2. **Network Tab**: Check for failed API requests
3. **Hardhat Console**: Look for compilation or deployment errors

#### Verify Service Status

1. **Infura**: Check [status.infura.io](https://status.infura.io/)
2. **Web3.Storage**: Check [status.web3.storage](https://web3.storage/)
3. **Sepolia Network**: Check [sepolia.etherscan.io](https://sepolia.etherscan.io/)

#### Reset and Restart

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset Hardhat cache
npx hardhat clean
npx hardhat compile

# Restart development server
npm run dev
```

## 🚀 Production Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains your built application
# Deploy this folder to any static hosting service:
# - Vercel, Netlify, GitHub Pages, AWS S3, etc.
```

### Environment Variables for Production

Create production environment variables:

```env
# Production .env
VITE_WALLETCONNECT_PROJECT_ID=your-production-project-id
VITE_IPFS_API_KEY=your-production-api-key
VITE_GRANT_FACTORY_ADDRESS=your-mainnet-contract-address
VITE_GOVERNANCE_TOKEN_ADDRESS=your-mainnet-governance-address
```

### Mainnet Deployment (Advanced)

⚠️ **Warning: Deploying to mainnet requires real ETH and carries financial risk**

```bash
# Add mainnet configuration to hardhat.config.js
# Update MAINNET_RPC_URL in environment
# Deploy with: npx hardhat run scripts/deploy.js --network mainnet
```

## 📚 Next Steps

### Learn More

1. **Smart Contract Development**: [Hardhat Documentation](https://hardhat.org/docs)
2. **React Development**: [React Documentation](https://reactjs.org/docs)
3. **Web3 Integration**: [Wagmi Documentation](https://wagmi.sh/)
4. **Supabase**: [Supabase Documentation](https://supabase.com/docs)

### Customize the Application

1. **Styling**: Modify Tailwind classes in components
2. **Features**: Add new pages in `src/pages/`
3. **Smart Contracts**: Extend contracts in `contracts/`
4. **Database**: Add tables via Supabase dashboard

### Join the Community

1. **Issues**: Report bugs or request features
2. **Discussions**: Share ideas and get help
3. **Contributing**: Submit pull requests

---

**🎉 Congratulations! Your GrantChain application is now set up and ready for development.**

For additional support, refer to the main [README.md](./README.md) or open an issue in the repository.

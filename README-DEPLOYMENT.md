
# 🚀 GrantChain Complete Deployment Guide

This guide will help you deploy GrantChain from development to a fully operational decentralized application.

## 🎯 Quick Start (Recommended)

For a complete automated deployment, run:

```bash
# 1. Deploy smart contracts to Sepolia
npm run deploy:complete

# 2. Verify contracts on Etherscan
npm run verify:contracts

# 3. Seed sample data
npm run seed:data
```

## 📋 Prerequisites

### Required
- **Node.js** (v18 or higher)
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** (get from [Sepolia faucet](https://sepoliafaucet.com/))

### API Keys Needed
- **Infura/Alchemy API Key** for Sepolia RPC
- **Etherscan API Key** for contract verification
- **Web3.Storage API Token** for IPFS (optional but recommended)
- **WalletConnect Project ID** (optional)

## 🔧 Environment Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd grantchain
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

3. **Update .env with your keys:**
   ```env
   # Blockchain Configuration
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
   PRIVATE_KEY=your-wallet-private-key-here
   ETHERSCAN_API_KEY=your-etherscan-api-key

   # IPFS Configuration (recommended)
   VITE_IPFS_API_KEY=your-web3-storage-api-key

   # WalletConnect (optional)
   VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
   ```

## 🏗️ Phase 1: Smart Contract Deployment

### Automated Deployment (Recommended)
```bash
# Deploy all contracts and configure system
npm run deploy:complete
```

This script will:
- Deploy GovernanceToken contract
- Deploy GrantFactory contract
- Configure permissions and ownership
- Create a test grant
- Update environment files
- Save deployment info

### Manual Deployment
If you prefer step-by-step deployment:

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 🌐 Phase 2: IPFS Configuration

### Option A: Web3.Storage (Recommended)
1. Sign up at [web3.storage](https://web3.storage)
2. Create an API token
3. Add to your `.env` file:
   ```env
   VITE_IPFS_API_KEY=your-web3-storage-token
   ```

### Option B: Development Mode
For testing without IPFS, the app will use mock hashes in development mode.

## 📊 Phase 3: Sample Data

```bash
# Seed the database with sample data
npm run seed:data
```

This creates:
- Sample user profiles (funder, grantee, auditor)
- Demo grants with different statuses
- Milestones and applications
- Test notifications

## 🧪 Phase 4: Testing & Validation

### Health Check
```bash
# Start the development server
npm run dev
```

Visit the application and check:
- ✅ System Status (top of homepage)
- ✅ Wallet connection works
- ✅ Grant creation functions
- ✅ Smart contract deployment status

### End-to-End Testing
1. **Connect Wallet** with Sepolia testnet
2. **Create Grant** - test the full flow
3. **Deploy Grant** - verify smart contract deployment
4. **Submit Milestone** - test grantee functions
5. **Vote on Milestone** - test DAO governance

## 📦 Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "deploy:complete": "npx hardhat run scripts/deploy-complete.js --network sepolia",
    "verify:contracts": "npx hardhat run scripts/verify-contracts.js --network sepolia",
    "seed:data": "node scripts/seed-data.js",
    "setup:env": "node scripts/setup-environment.js"
  }
}
```

## 🔍 Troubleshooting

### Common Issues

**1. "Insufficient Balance" Error**
- Get Sepolia ETH from faucets:
  - [Sepolia Faucet](https://sepoliafaucet.com/)
  - [Chainlink Faucet](https://faucets.chain.link/)

**2. "Contract Not Deployed" Warning**
- Run `npm run deploy:complete`
- Check `.env` for correct contract addresses

**3. "IPFS Upload Failed"**
- Configure `VITE_IPFS_API_KEY` in `.env`
- Or use development mode with mock hashes

**4. "Wallet Connection Issues"**
- Make sure MetaMask is set to Sepolia testnet
- Check WalletConnect project ID

### Deployment Status Dashboard

The application includes a real-time deployment status dashboard at the top of the homepage showing:

- ✅ Smart contract deployment status
- ✅ IPFS configuration status  
- ✅ Overall system health
- 📋 Configuration instructions if needed

## 🎯 Production Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

### Mainnet Deployment
⚠️ **Only after thorough testing on Sepolia!**

1. Update Hardhat config for mainnet
2. Ensure sufficient ETH for gas fees
3. Deploy with `--network mainnet`
4. Update frontend contract addresses

## 🔒 Security Checklist

- [ ] Private keys secured and not in version control
- [ ] Smart contracts audited (for mainnet)
- [ ] RLS policies tested and verified
- [ ] Rate limiting configured
- [ ] HTTPS enabled in production
- [ ] Environment variables properly set

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting section](#troubleshooting)
2. Review console logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure Sepolia testnet ETH balance is sufficient

---

## 🏆 Success Criteria

Your deployment is complete when:

- ✅ System Status shows "Fully Operational"
- ✅ Smart contracts verified on Etherscan
- ✅ IPFS uploads working
- ✅ Sample grants and data visible
- ✅ End-to-end grant workflow functional
- ✅ DAO voting mechanisms working

**Congratulations! 🎉 GrantChain is now a fully operational dApp!**

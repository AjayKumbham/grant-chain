import { Address } from 'viem'

// Contract addresses - these will be populated after deployment
export const CONTRACT_ADDRESSES = {
  sepolia: {
    GRANT_FACTORY: (import.meta.env.VITE_GRANT_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    GOVERNANCE_TOKEN: (import.meta.env.VITE_GOVERNANCE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
  },
  localhost: {
    GRANT_FACTORY: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
    GOVERNANCE_TOKEN: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
  },
  mainnet: {
    GRANT_FACTORY: '0x0000000000000000000000000000000000000000' as Address,
    GOVERNANCE_TOKEN: '0x0000000000000000000000000000000000000000' as Address,
  }
} as const

// Contract deployment status checker
export const getDeploymentStatus = () => {
  const network = 'sepolia' // Can be made dynamic based on chain
  const factoryAddress = CONTRACT_ADDRESSES[network].GRANT_FACTORY
  const tokenAddress = CONTRACT_ADDRESSES[network].GOVERNANCE_TOKEN
  
  return {
    isDeployed: factoryAddress !== '0x0000000000000000000000000000000000000000' && 
                tokenAddress !== '0x0000000000000000000000000000000000000000',
    factoryAddress,
    tokenAddress,
    network
  }
}

// Complete contract ABIs from compiled contracts
export const GRANT_FACTORY_ABI = [
  {
    inputs: [{ name: '_governanceToken', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { name: '_title', type: 'string' },
      { name: '_totalAmount', type: 'uint256' },
      { name: '_milestoneCount', type: 'uint256' },
      { name: '_ipfsHash', type: 'string' },
      { name: '_votingPeriod', type: 'uint256' }
    ],
    name: 'createGrant',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllGrants',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_funder', type: 'address' }],
    name: 'getFunderGrants',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'grantAddress', type: 'address' },
      { indexed: true, name: 'funder', type: 'address' },
      { indexed: false, name: 'title', type: 'string' },
      { indexed: false, name: 'totalAmount', type: 'uint256' },
      { indexed: false, name: 'milestoneCount', type: 'uint256' },
      { indexed: false, name: 'ipfsHash', type: 'string' }
    ],
    name: 'GrantCreated',
    type: 'event',
  },
] as const

export const GRANT_ABI = [
  {
    inputs: [{ name: '_grantee', type: 'address' }],
    name: 'assignGrantee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_milestoneIndex', type: 'uint256' },
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'setMilestoneDetails',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_milestoneIndex', type: 'uint256' },
      { name: '_proofIpfsHash', type: 'string' }
    ],
    name: 'submitMilestone',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_votingSessionId', type: 'uint256' },
      { name: '_approve', type: 'bool' }
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_milestoneIndex', type: 'uint256' }],
    name: 'finalizeVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_index', type: 'uint256' }],
    name: 'getMilestone',
    outputs: [
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_amount', type: 'uint256' },
      { name: '_completed', type: 'bool' },
      { name: '_fundsReleased', type: 'bool' },
      { name: '_proofIpfsHash', type: 'string' },
      { name: '_submittedAt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMilestoneCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_sessionId', type: 'uint256' }],
    name: 'getVotingSession',
    outputs: [
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'yesVotes', type: 'uint256' },
      { name: 'noVotes', type: 'uint256' },
      { name: 'finalized', type: 'bool' },
      { name: 'approved', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'title',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'funder',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'grantee',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'status',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: false, name: 'proofIpfsHash', type: 'string' }
    ],
    name: 'MilestoneSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: true, name: 'votingSessionId', type: 'uint256' },
      { indexed: false, name: 'endTime', type: 'uint256' }
    ],
    name: 'VotingStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'votingSessionId', type: 'uint256' },
      { indexed: true, name: 'voter', type: 'address' },
      { indexed: false, name: 'vote', type: 'bool' },
      { indexed: false, name: 'weight', type: 'uint256' }
    ],
    name: 'VoteCast',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'milestoneIndex', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'MilestoneApproved',
    type: 'event',
  },
] as const

export const GOVERNANCE_TOKEN_ABI = [
  {
    inputs: [{ name: '_amount', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_amount', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getVotingPower',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getStakingInfo',
    outputs: [
      { name: 'stakedAmount', type: 'uint256' },
      { name: 'stakingTime', type: 'uint256' },
      { name: 'reputation', type: 'uint256' },
      { name: 'votingPower', type: 'uint256' },
      { name: 'pendingRewards', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const getContractAddress = (network: keyof typeof CONTRACT_ADDRESSES, contract: string): Address => {
  return CONTRACT_ADDRESSES[network][contract as keyof typeof CONTRACT_ADDRESSES[typeof network]] || '0x'
}

// Helper function to update contract addresses after deployment
export const updateContractAddresses = (network: keyof typeof CONTRACT_ADDRESSES, addresses: Partial<typeof CONTRACT_ADDRESSES['sepolia']>) => {
  Object.assign(CONTRACT_ADDRESSES[network], addresses)
}

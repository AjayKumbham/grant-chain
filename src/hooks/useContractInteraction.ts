
import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import { sepolia } from 'wagmi/chains'
import { supabase } from '@/integrations/supabase/client'
import { uploadJSONToIPFS } from '@/lib/ipfs'
import { GRANT_FACTORY_ABI, GRANT_ABI, GOVERNANCE_TOKEN_ABI, getContractAddress } from '@/lib/contracts'
import { useToast } from '@/hooks/use-toast'

export const useContractInteraction = () => {
  const { address } = useAccount()
  const { toast } = useToast()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'uploading' | 'deploying' | 'updating' | 'completed'>('idle')

  // Get contract addresses with validation
  const grantFactoryAddress = getContractAddress('sepolia', 'GRANT_FACTORY')
  const governanceTokenAddress = getContractAddress('sepolia', 'GOVERNANCE_TOKEN')

  // Get voting power for current user
  const { data: votingPower } = useReadContract({
    address: governanceTokenAddress !== '0x0000000000000000000000000000000000000000' ? governanceTokenAddress : undefined,
    abi: GOVERNANCE_TOKEN_ABI,
    functionName: 'getVotingPower',
    args: address ? [address] : undefined,
  })

  const deployGrant = async (grantData: {
    id: string
    title: string
    description: string
    totalAmount: number
    milestones: any[]
  }) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deploy the grant contract.",
        variant: "destructive",
      })
      throw new Error('Wallet not connected')
    }
    
    // Check if contracts are deployed
    if (grantFactoryAddress === '0x0000000000000000000000000000000000000000') {
      toast({
        title: "Contracts Not Deployed",
        description: "Smart contracts need to be deployed first. Please check the deployment status.",
        variant: "destructive",
      })
      throw new Error('Contracts not deployed')
    }

    // Validate grant data
    if (!grantData.title || !grantData.description || grantData.totalAmount <= 0 || !grantData.milestones.length) {
      toast({
        title: "Invalid Grant Data",
        description: "Please ensure all grant fields are properly filled.",
        variant: "destructive",
      })
      throw new Error('Invalid grant data')
    }

    try {
      setDeploymentStatus('uploading')
      
      // Upload grant metadata to IPFS
      const metadata = {
        title: grantData.title,
        description: grantData.description,
        milestones: grantData.milestones.map((milestone, index) => ({
          ...milestone,
          index,
          id: `milestone-${index}`,
        })),
        created_at: new Date().toISOString(),
        funder: address,
        version: '1.0'
      }
      
      const ipfsHash = await uploadJSONToIPFS(metadata)
      
      setDeploymentStatus('deploying')
      
      const totalAmountWei = parseEther(grantData.totalAmount.toString())
      const votingPeriod = 7 * 24 * 60 * 60 // 7 days in seconds
      
      // Deploy contract to blockchain
      await writeContract({
        address: grantFactoryAddress,
        abi: GRANT_FACTORY_ABI,
        functionName: 'createGrant',
        args: [
          grantData.title,
          totalAmountWei,
          BigInt(grantData.milestones.length),
          ipfsHash,
          BigInt(votingPeriod)
        ],
        value: totalAmountWei,
        chain: sepolia,
        account: address
      })

      // Wait for transaction confirmation
      if (hash) {
        setDeploymentStatus('updating')
        
        // Update database with deployment info
        const { error: updateError } = await supabase
          .from('grants')
          .update({
            contract_address: hash, // Transaction hash - will be updated with actual contract address
            contract_deployed: true,
            blockchain_network: 'sepolia',
            ipfs_hash: ipfsHash,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', grantData.id)

        if (updateError) {
          console.error('Database update error:', updateError)
          // Don't throw here as the contract deployment succeeded
          toast({
            title: "Contract Deployed",
            description: "Grant deployed successfully, but database update failed. Please refresh the page.",
            variant: "default",
          })
        }
      }

      setDeploymentStatus('completed')
      
      toast({
        title: "Grant Contract Deployed Successfully!",
        description: "Your grant is now live on the Sepolia testnet and ready for applications.",
      })

      return { contractAddress: hash, ipfsHash }
      
    } catch (err) {
      setDeploymentStatus('idle')
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy grant contract'
      
      toast({
        title: "Deployment Failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      console.error('Grant deployment error:', err)
      throw new Error(errorMessage)
    }
  }

  const voteOnMilestone = async (contractAddress: string, votingSessionId: number, approve: boolean) => {
    if (!address) throw new Error('Wallet not connected')

    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: GRANT_ABI,
        functionName: 'vote',
        args: [BigInt(votingSessionId), approve],
        chain: sepolia,
        account: address
      })

      toast({
        title: "Vote Submitted",
        description: `Your ${approve ? 'approval' : 'rejection'} vote has been submitted on-chain.`,
      })
      
    } catch (err) {
      toast({
        title: "Vote Failed",
        description: err instanceof Error ? err.message : 'Failed to submit vote',
        variant: "destructive",
      })
      throw err
    }
  }

  const submitMilestone = async (contractAddress: string, milestoneIndex: number, proofIpfsHash: string) => {
    if (!address) throw new Error('Wallet not connected')

    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: GRANT_ABI,
        functionName: 'submitMilestone',
        args: [BigInt(milestoneIndex), proofIpfsHash],
        chain: sepolia,
        account: address
      })

      toast({
        title: "Milestone Submitted",
        description: "Milestone submitted for community review and voting.",
      })
      
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : 'Failed to submit milestone',
        variant: "destructive",
      })
      throw err
    }
  }

  const stakeTokens = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected')

    try {
      const amountWei = parseEther(amount)
      
      await writeContract({
        address: governanceTokenAddress,
        abi: GOVERNANCE_TOKEN_ABI,
        functionName: 'stake',
        args: [amountWei],
        chain: sepolia,
        account: address
      })

      toast({
        title: "Tokens Staked",
        description: "Your tokens have been staked to increase voting power.",
      })
      
    } catch (err) {
      toast({
        title: "Staking Failed",
        description: err instanceof Error ? err.message : 'Failed to stake tokens',
        variant: "destructive",
      })
      throw err
    }
  }

  return {
    deployGrant,
    voteOnMilestone,
    submitMilestone,
    stakeTokens,
    deploymentStatus,
    isContractPending: isPending,
    isContractConfirming: isConfirming,
    isContractConfirmed: isConfirmed,
    contractError: error,
    votingPower: votingPower ? Number(votingPower) : 0,
    contractsDeployed: grantFactoryAddress !== '0x0000000000000000000000000000000000000000'
  }
}

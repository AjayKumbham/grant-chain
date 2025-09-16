
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, ExternalLink, Zap, Shield, Globe } from 'lucide-react'
import { useContractInteraction } from '@/hooks/useContractInteraction'
import { useToast } from '@/hooks/use-toast'

interface DecentralizedGrantDeploymentProps {
  grantData: {
    id: string
    title: string
    description: string
    totalAmount: number
    milestones: any[]
  }
  onDeploymentComplete?: (contractAddress: string, ipfsHash: string) => void
}

export const DecentralizedGrantDeployment = ({ 
  grantData, 
  onDeploymentComplete 
}: DecentralizedGrantDeploymentProps) => {
  const { toast } = useToast()
  const { 
    deployGrant, 
    deploymentStatus, 
    isContractPending, 
    isContractConfirming,
    contractError 
  } = useContractInteraction()

  const [deploymentResult, setDeploymentResult] = useState<{
    contractAddress?: string
    ipfsHash?: string
  } | null>(null)

  const handleDeploy = async () => {
    try {
      const result = await deployGrant(grantData)
      setDeploymentResult(result)
      onDeploymentComplete?.(result.contractAddress, result.ipfsHash)
    } catch (error) {
      console.error('Deployment failed:', error)
    }
  }

  const getStatusBadge = () => {
    switch (deploymentStatus) {
      case 'idle':
        return <Badge variant="secondary">Ready to Deploy</Badge>
      case 'uploading':
        return <Badge variant="outline" className="text-blue-600">
          <Globe className="h-3 w-3 mr-1" />
          Uploading to IPFS
        </Badge>
      case 'deploying':
        return <Badge variant="outline" className="text-yellow-600">
          <Zap className="h-3 w-3 mr-1" />
          Deploying Contract
        </Badge>
      case 'updating':
        return <Badge variant="outline" className="text-purple-600">Updating Database</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Deployed
        </Badge>
      default:
        return null
    }
  }

  const getProgressValue = () => {
    switch (deploymentStatus) {
      case 'uploading': return 25
      case 'deploying': return 50
      case 'updating': return 75
      case 'completed': return 100
      default: return 0
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Decentralized Grant Deployment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            True Decentralization Features:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Smart contract deployed to Sepolia testnet with real escrow</li>
            <li>• Metadata permanently stored on IPFS network</li>
            <li>• DAO governance with token-based voting power</li>
            <li>• Milestone-based fund release with community approval</li>
            <li>• No central authority can control funds or decisions</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-900">Network</div>
            <div className="text-xs text-green-700">Sepolia Testnet</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-sm font-medium text-purple-900">Storage</div>
            <div className="text-xs text-purple-700">IPFS Distributed</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Deployment Status</span>
            {getStatusBadge()}
          </div>
          
          {deploymentStatus !== 'idle' && deploymentStatus !== 'completed' && (
            <Progress value={getProgressValue()} className="h-2" />
          )}
        </div>

        {contractError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <div className="font-medium">Deployment Failed</div>
              <div className="mt-1">{contractError.message}</div>
            </div>
          </div>
        )}

        {deploymentResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Decentralized Deployment Successful!</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-green-900">Transaction Hash:</span>
                <div className="font-mono text-green-700 break-all text-xs">
                  {deploymentResult.contractAddress}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-green-900">IPFS Hash:</span>
                <div className="font-mono text-green-700 break-all text-xs">
                  {deploymentResult.ipfsHash}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${deploymentResult.contractAddress}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Transaction
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://w3s.link/ipfs/${deploymentResult.ipfsHash}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on IPFS
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={handleDeploy}
          disabled={deploymentStatus !== 'idle' && deploymentStatus !== 'completed'}
          className="w-full"
          size="lg"
        >
          {deploymentStatus === 'idle' ? 'Deploy Decentralized Grant' : 
           deploymentStatus === 'completed' ? 'Redeploy' : 
           'Deploying...'}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Real Solidity smart contracts with escrow functionality</p>
          <p>• Requires Sepolia ETH for transaction fees</p>
          <p>• Funds are held in contract until milestone approval</p>
          <p>• Community governance through token voting</p>
        </div>
      </CardContent>
    </Card>
  )
}

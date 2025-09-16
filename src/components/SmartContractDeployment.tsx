
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, ExternalLink, Zap } from 'lucide-react'
import { useContractInteraction } from '@/hooks/useContractInteraction'
import { useToast } from '@/hooks/use-toast'

interface SmartContractDeploymentProps {
  grantData: {
    id: string
    title: string
    description: string
    totalAmount: number
    milestones: any[]
  }
  onDeploymentComplete?: (contractAddress: string, ipfsHash: string) => void
}

export const SmartContractDeployment = ({ 
  grantData, 
  onDeploymentComplete 
}: SmartContractDeploymentProps) => {
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
        return <Badge variant="outline" className="text-blue-600">Uploading to IPFS</Badge>
      case 'deploying':
        return <Badge variant="outline" className="text-yellow-600">Deploying Contract</Badge>
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
          <Zap className="h-5 w-5" />
          Smart Contract Deployment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens during deployment:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Grant metadata uploaded to IPFS for permanent storage</li>
            <li>• Smart contract deployed to Sepolia testnet</li>
            <li>• Escrow functionality enabled for milestone-based funding</li>
            <li>• DAO governance integrated for community oversight</li>
          </ul>
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
              <span className="font-medium">Deployment Successful!</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-green-900">Contract Address:</span>
                <div className="font-mono text-green-700 break-all">
                  {deploymentResult.contractAddress}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-green-900">IPFS Hash:</span>
                <div className="font-mono text-green-700 break-all">
                  {deploymentResult.ipfsHash}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${deploymentResult.contractAddress}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Etherscan
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
        >
          {deploymentStatus === 'idle' ? 'Deploy to Blockchain' : 
           deploymentStatus === 'completed' ? 'Redeploy' : 
           'Deploying...'}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Deployment will create a new smart contract on Sepolia testnet</p>
          <p>• Transaction fees will be paid in Sepolia ETH</p>
          <p>• Contract will be immutable once deployed</p>
        </div>
      </CardContent>
    </Card>
  )
}

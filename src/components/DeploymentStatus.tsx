
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react'
import { getDeploymentStatus } from '@/lib/contracts'
import { checkIPFSHealth } from '@/lib/ipfs'

export const DeploymentStatus = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null)
  const [ipfsStatus, setIpfsStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check contract deployment status
        const contractStatus = getDeploymentStatus()
        setDeploymentStatus(contractStatus)

        // Check IPFS status
        const ipfsHealth = await checkIPFSHealth()
        setIpfsStatus(ipfsHealth)
      } catch (error) {
        console.error('Failed to check deployment status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  const getStatusBadge = (isHealthy: boolean, label: string) => {
    if (isHealthy) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {label}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-red-600 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-gray-600">Checking deployment status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isFullyDeployed = deploymentStatus?.isDeployed && ipfsStatus?.status === 'healthy'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Overall Status</span>
          {isFullyDeployed ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Fully Operational
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Needs Configuration
            </Badge>
          )}
        </div>

        {/* Smart Contracts Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Smart Contracts</span>
            {getStatusBadge(deploymentStatus?.isDeployed || false, 
              deploymentStatus?.isDeployed ? 'Deployed' : 'Not Deployed')}
          </div>
          
          {deploymentStatus?.isDeployed && (
            <div className="text-xs space-y-1 text-gray-600">
              <div>Network: {deploymentStatus.network}</div>
              <div className="flex items-center gap-2">
                <span>Factory:</span>
                <code className="text-xs bg-gray-100 px-1 rounded">
                  {deploymentStatus.factoryAddress.slice(0, 10)}...
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${deploymentStatus.factoryAddress}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* IPFS Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">IPFS Storage</span>
            {getStatusBadge(ipfsStatus?.status === 'healthy', 
              ipfsStatus?.status === 'healthy' ? 'Connected' : 
              ipfsStatus?.status === 'degraded' ? 'Degraded' : 'Disconnected')}
          </div>
          
          {ipfsStatus?.message && (
            <div className="text-xs text-gray-600">
              {ipfsStatus.message}
            </div>
          )}
        </div>

        {/* Configuration Instructions */}
        {!isFullyDeployed && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-800 mb-2">
              Configuration Required
            </div>
            <div className="text-xs text-yellow-700 space-y-1">
              {!deploymentStatus?.isDeployed && (
                <div>• Deploy smart contracts to Sepolia testnet</div>
              )}
              {ipfsStatus?.status !== 'healthy' && (
                <div>• Configure IPFS API key (VITE_IPFS_API_KEY)</div>
              )}
              <div>• See README-DEPLOYMENT.md for detailed instructions</div>
            </div>
          </div>
        )}

        {isFullyDeployed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800">
              🎉 GrantChain is fully operational!
            </div>
            <div className="text-xs text-green-700 mt-1">
              All systems are configured and ready for use.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

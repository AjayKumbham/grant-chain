
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, Vote, Shield } from 'lucide-react'
import { useContractInteraction } from '@/hooks/useContractInteraction'
import { useAccount } from 'wagmi'

export const GovernanceStaking = () => {
  const { address } = useAccount()
  const { stakeTokens, votingPower } = useContractInteraction()
  const [stakeAmount, setStakeAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStake = async () => {
    if (!stakeAmount || !address) return
    
    try {
      setLoading(true)
      await stakeTokens(stakeAmount)
      setStakeAmount('')
    } catch (error) {
      console.error('Staking failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Governance Participation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
              <TrendingUp className="h-4 w-4" />
              Voting Power
            </div>
            <div className="text-2xl font-bold text-blue-700">{votingPower}</div>
            <div className="text-xs text-blue-600">Current stake + reputation</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-900 font-medium text-sm">
              <Shield className="h-4 w-4" />
              Governance Rights
            </div>
            <Badge variant="outline" className="text-green-700">
              {votingPower > 0 ? 'Active Voter' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">How Governance Works:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Stake GCT tokens to gain voting power</li>
            <li>• Vote on milestone approvals for all grants</li>
            <li>• Earn reputation through quality decisions</li>
            <li>• Reputation multiplies your voting power</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Stake GCT Tokens</span>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              disabled={!address}
            />
            <Button 
              onClick={handleStake}
              disabled={!stakeAmount || !address || loading}
            >
              {loading ? 'Staking...' : 'Stake'}
            </Button>
          </div>
          
          {!address && (
            <p className="text-xs text-gray-500">Connect wallet to participate in governance</p>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Staked tokens earn daily rewards</p>
          <p>• Minimum 24-hour staking period</p>
          <p>• Voting participation increases reputation</p>
        </div>
      </CardContent>
    </Card>
  )
}

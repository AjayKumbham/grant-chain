
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Wifi, Database, FileText, Users, Wallet } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAccount } from 'wagmi'
import { useContractInteraction } from '@/hooks/useContractInteraction'

export const AppStatus = () => {
  const { isConnected } = useAccount()
  const { contractsDeployed } = useContractInteraction()
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [dbTables, setDbTables] = useState<string[]>([])

  useEffect(() => {
    checkSupabaseConnection()
  }, [])

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('grants').select('count', { count: 'exact', head: true })
      if (error) throw error
      setSupabaseStatus('connected')
      
      // Check available tables
      const tables = ['grants', 'milestones', 'grant_applications', 'user_profiles', 'notifications', 'voting_sessions']
      setDbTables(tables)
    } catch (error) {
      console.error('Supabase connection error:', error)
      setSupabaseStatus('error')
    }
  }

  const getStatusIcon = (status: boolean | 'checking' | 'connected' | 'error') => {
    if (status === 'checking') return <AlertCircle className="w-4 h-4 text-yellow-500" />
    if (status === true || status === 'connected') return <CheckCircle className="w-4 h-4 text-green-500" />
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusBadge = (status: boolean | 'checking' | 'connected' | 'error') => {
    if (status === 'checking') return <Badge variant="secondary">Checking</Badge>
    if (status === true || status === 'connected') return <Badge className="bg-green-100 text-green-700">Ready</Badge>
    return <Badge variant="destructive">Error</Badge>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Application Status Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="w-4 h-4" />
              Backend Services
            </h3>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(supabaseStatus)}
                <span>Supabase Connection</span>
              </div>
              {getStatusBadge(supabaseStatus)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(dbTables.length > 0)}
                <span>Database Tables ({dbTables.length})</span>
              </div>
              {getStatusBadge(dbTables.length > 0)}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Web3 Integration
            </h3>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(isConnected)}
                <span>Wallet Connection</span>
              </div>
              {getStatusBadge(isConnected)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(contractsDeployed)}
                <span>Smart Contracts</span>
              </div>
              {getStatusBadge(contractsDeployed)}
            </div>
          </div>
        </div>

        {/* Available Features */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Available Features
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'Grant Creation',
              'Grant Applications', 
              'Milestone Management',
              'DAO Voting',
              'User Profiles',
              'Notifications',
              'Analytics Dashboard',
              'IPFS Storage'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 p-2 border rounded text-sm">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Testing Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Quick Testing Actions
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/grants'}>
              View Grants
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/create'}>
              Create Grant
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/analytics'}>
              View Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={checkSupabaseConnection}>
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Environment Status</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>• Supabase: {supabaseStatus === 'connected' ? 'Connected' : 'Not Connected'}</div>
            <div>• Web3 Provider: {isConnected ? 'Connected' : 'Not Connected'}</div>
            <div>• Smart Contracts: {contractsDeployed ? 'Deployed' : 'Not Deployed'}</div>
            <div>• Database Tables: {dbTables.length} tables available</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

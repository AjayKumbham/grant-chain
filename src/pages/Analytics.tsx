
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, TrendingUp, Users, Vote, Award, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAnalytics } from '@/hooks/useAnalytics'
import { FundingMetrics } from '@/components/analytics/FundingMetrics'
import { MilestoneAnalytics } from '@/components/analytics/MilestoneAnalytics'
import { GovernanceMetrics } from '@/components/analytics/GovernanceMetrics'

export default function Analytics() {
  const { data, loading, error, exportAnalytics } = useAnalytics()
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="text-red-600 font-medium">Error loading analytics</div>
              <div className="text-gray-500 text-sm">{error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights into grant funding, milestone progress, and DAO governance
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportAnalytics('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="funding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funding" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Funding
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funding">
          <FundingMetrics data={data.grantMetrics} />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestoneAnalytics data={data.milestoneMetrics} />
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userMetrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered participants</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Funders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userMetrics.activeFunders}</div>
                <p className="text-xs text-muted-foreground">Creating opportunities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Grantees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userMetrics.activeGrantees}</div>
                <p className="text-xs text-muted-foreground">Building projects</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="governance">
          <GovernanceMetrics data={data.governanceMetrics} />
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Smart Contract & IPFS Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Smart Contract Deployment</h4>
              <p className="text-sm text-gray-600 mb-2">
                Grants can now be deployed as smart contracts on Sepolia testnet
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">IPFS File Storage</h4>
              <p className="text-sm text-gray-600 mb-2">
                Critical files are now stored on IPFS for permanence and integrity
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

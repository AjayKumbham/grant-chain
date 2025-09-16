
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GovernanceMetricsProps {
  data: {
    totalVotes: number
    participationRate: number
    consensusRate: number
    votingTrends: Array<{ date: string; votes: number; participation: number }>
  }
}

export const GovernanceMetrics = ({ data }: GovernanceMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalVotes}</div>
          <p className="text-xs text-muted-foreground">Community decisions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.participationRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Active voters</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consensus Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.consensusRate}%</div>
          <p className="text-xs text-muted-foreground">Agreement reached</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Governance Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.votingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="votes" stroke="#8884d8" name="Total Votes" />
              <Line yAxisId="right" type="monotone" dataKey="participation" stroke="#82ca9d" name="Participation %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface FundingMetricsProps {
  data: {
    totalGrants: number
    totalFunding: number
    successRate: number
    avgCompletionTime: number
    fundingTrends: Array<{ date: string; amount: number; count: number }>
  }
}

export const FundingMetrics = ({ data }: FundingMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalGrants}</div>
          <p className="text-xs text-muted-foreground">Active funding opportunities</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalFunding.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Locked in smart contracts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.successRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Completed grants</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.avgCompletionTime} days</div>
          <p className="text-xs text-muted-foreground">Time to complete</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Funding Trends (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.fundingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Funding Amount" />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Grant Count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

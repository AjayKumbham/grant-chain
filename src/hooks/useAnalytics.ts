
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface AnalyticsData {
  grantMetrics: {
    totalGrants: number
    totalFunding: number
    successRate: number
    avgCompletionTime: number
    fundingTrends: Array<{ date: string; amount: number; count: number }>
  }
  milestoneMetrics: {
    totalMilestones: number
    approvalRate: number
    avgApprovalTime: number
    statusDistribution: Array<{ status: string; count: number }>
  }
  userMetrics: {
    totalUsers: number
    activeFunders: number
    activeGrantees: number
    userGrowth: Array<{ date: string; count: number }>
  }
  governanceMetrics: {
    totalVotes: number
    participationRate: number
    consensusRate: number
    votingTrends: Array<{ date: string; votes: number; participation: number }>
  }
}

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch grant analytics
      const { data: grants } = await supabase
        .from('grants')
        .select('*')
      
      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
      
      const { data: users } = await supabase
        .from('user_profiles')
        .select('*')
      
      const { data: votes } = await supabase
        .from('milestone_votes')
        .select('*')

      // Calculate grant metrics
      const totalGrants = grants?.length || 0
      const totalFunding = grants?.reduce((sum, g) => sum + (g.total_amount || 0), 0) || 0
      const completedGrants = grants?.filter(g => g.status === 'completed').length || 0
      const successRate = totalGrants > 0 ? (completedGrants / totalGrants) * 100 : 0

      // Calculate funding trends (last 7 days)
      const fundingTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayGrants = grants?.filter(g => 
          g.created_at?.startsWith(dateStr)
        ) || []
        
        return {
          date: dateStr,
          amount: dayGrants.reduce((sum, g) => sum + (g.total_amount || 0), 0),
          count: dayGrants.length
        }
      }).reverse()

      // Calculate milestone metrics
      const totalMilestones = milestones?.length || 0
      const approvedMilestones = milestones?.filter(m => m.status === 'approved').length || 0
      const approvalRate = totalMilestones > 0 ? (approvedMilestones / totalMilestones) * 100 : 0

      const statusDistribution = ['pending', 'submitted', 'under_review', 'approved', 'rejected']
        .map(status => ({
          status,
          count: milestones?.filter(m => m.status === status).length || 0
        }))

      // Calculate user metrics
      const totalUsers = users?.length || 0
      const activeFunders = users?.filter(u => u.role === 'funder').length || 0
      const activeGrantees = users?.filter(u => u.role === 'grantee').length || 0

      const userGrowth = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayUsers = users?.filter(u => 
          u.created_at?.startsWith(dateStr)
        ).length || 0
        
        return { date: dateStr, count: dayUsers }
      }).reverse()

      // Calculate governance metrics
      const totalVotes = votes?.length || 0
      const uniqueVoters = new Set(votes?.map(v => v.voter_wallet)).size
      const participationRate = totalUsers > 0 ? (uniqueVoters / totalUsers) * 100 : 0

      const votingTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayVotes = votes?.filter(v => 
          v.created_at?.startsWith(dateStr)
        ) || []
        
        const dayUniqueVoters = new Set(dayVotes.map(v => v.voter_wallet)).size
        
        return {
          date: dateStr,
          votes: dayVotes.length,
          participation: totalUsers > 0 ? (dayUniqueVoters / totalUsers) * 100 : 0
        }
      }).reverse()

      setData({
        grantMetrics: {
          totalGrants,
          totalFunding,
          successRate,
          avgCompletionTime: 30, // Mock data
          fundingTrends
        },
        milestoneMetrics: {
          totalMilestones,
          approvalRate,
          avgApprovalTime: 24, // Mock data
          statusDistribution
        },
        userMetrics: {
          totalUsers,
          activeFunders,
          activeGrantees,
          userGrowth
        },
        governanceMetrics: {
          totalVotes,
          participationRate,
          consensusRate: 85, // Mock data
          votingTrends
        }
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async (format: 'csv' | 'pdf') => {
    if (!data) return

    try {
      if (format === 'csv') {
        const csvData = [
          ['Metric', 'Value'],
          ['Total Grants', data.grantMetrics.totalGrants.toString()],
          ['Total Funding', data.grantMetrics.totalFunding.toString()],
          ['Success Rate', `${data.grantMetrics.successRate.toFixed(1)}%`],
          ['Total Milestones', data.milestoneMetrics.totalMilestones.toString()],
          ['Approval Rate', `${data.milestoneMetrics.approvalRate.toFixed(1)}%`],
          ['Total Users', data.userMetrics.totalUsers.toString()],
          ['Active Funders', data.userMetrics.activeFunders.toString()],
          ['Active Grantees', data.userMetrics.activeGrantees.toString()],
          ['Total Votes', data.governanceMetrics.totalVotes.toString()],
          ['Participation Rate', `${data.governanceMetrics.participationRate.toFixed(1)}%`]
        ]
        
        const csvContent = csvData.map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grant-analytics-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
    exportAnalytics
  }
}

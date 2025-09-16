
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type GrantApplication = Database['public']['Tables']['grant_applications']['Row']

export const useGrantApplications = (grantId?: string) => {
  const { address, isConnected } = useAccount()
  const [applications, setApplications] = useState<GrantApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async (targetGrantId?: string) => {
    const queryGrantId = targetGrantId || grantId
    if (!queryGrantId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('grant_applications')
        .select('*')
        .eq('grant_id', queryGrantId)
        .order('application_date', { ascending: false })

      if (error) throw error

      setApplications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const createApplication = async (
    targetGrantId: string,
    applicationData: {
      proposal_title: string
      proposal_description: string
      requested_amount?: number
    }
  ) => {
    if (!address) throw new Error('Wallet not connected')

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('grant_applications')
        .insert({
          grant_id: targetGrantId,
          applicant_wallet: address.toLowerCase(),
          ...applicationData,
        })
        .select()
        .single()

      if (error) throw error

      await fetchApplications(targetGrantId)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (
    applicationId: string,
    status: 'approved' | 'rejected' | 'under_review',
    reviewNotes?: string
  ) => {
    if (!address) throw new Error('Wallet not connected')

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('grant_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewer_wallet: address.toLowerCase(),
          review_notes: reviewNotes || null,
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (error) throw error

      await fetchApplications()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (grantId) {
      fetchApplications()
    }
  }, [grantId])

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplicationStatus,
    refetch: () => fetchApplications(),
  }
}

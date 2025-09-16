
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Milestone = Database['public']['Tables']['milestones']['Row']
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert']
type MilestoneUpdate = Database['public']['Tables']['milestones']['Update']

export const useMilestones = (grantId?: string) => {
  const { address, isConnected } = useAccount()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMilestones = async (targetGrantId?: string) => {
    const queryGrantId = targetGrantId || grantId
    if (!queryGrantId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('grant_id', queryGrantId)
        .order('order_index')

      if (error) throw error

      setMilestones(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones')
    } finally {
      setLoading(false)
    }
  }

  const submitMilestone = async (
    milestoneId: string,
    proofData: {
      proof_description: string
      proof_url?: string | null
      attachments?: string[]
    }
  ) => {
    if (!address) throw new Error('Wallet not connected')

    setLoading(true)
    setError(null)

    try {
      const updateData: MilestoneUpdate = {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        proof_description: proofData.proof_description,
        proof_url: proofData.proof_url,
      }

      const { data, error } = await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', milestoneId)
        .select()
        .single()

      if (error) throw error

      await fetchMilestones()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit milestone')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reviewMilestone = async (
    milestoneId: string,
    status: 'approved' | 'rejected',
    reviewNotes?: string
  ) => {
    if (!address) throw new Error('Wallet not connected')

    setLoading(true)
    setError(null)

    try {
      const updateData: MilestoneUpdate = {
        status: status === 'approved' ? 'approved' : 'rejected',
        reviewer_wallet: address.toLowerCase(),
        review_notes: reviewNotes || null,
      }

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', milestoneId)
        .select()
        .single()

      if (error) throw error

      await fetchMilestones()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review milestone')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createMilestones = async (
    targetGrantId: string,
    milestonesData: Omit<MilestoneInsert, 'grant_id'>[]
  ) => {
    if (!address) throw new Error('Wallet not connected')

    setLoading(true)
    setError(null)

    try {
      const milestonesWithGrantId = milestonesData.map((milestone, index) => ({
        ...milestone,
        grant_id: targetGrantId,
        order_index: index,
      }))

      const { data, error } = await supabase
        .from('milestones')
        .insert(milestonesWithGrantId)
        .select()

      if (error) throw error

      await fetchMilestones(targetGrantId)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create milestones')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (grantId) {
      fetchMilestones()
    }
  }, [grantId])

  return {
    milestones,
    loading,
    error,
    submitMilestone,
    reviewMilestone,
    createMilestones,
    refetch: () => fetchMilestones(),
  }
}


import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useSecurityCheck } from '@/lib/security'
import { grantSchema, milestoneSchema } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

type Grant = Database['public']['Tables']['grants']['Row']
type GrantInsert = Database['public']['Tables']['grants']['Insert']
type Milestone = Database['public']['Tables']['milestones']['Row']
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert']

export const useGrants = () => {
  const { address } = useAccount()
  const { user, isReady } = useAuth()
  const { requireReady, checkRateLimitWithToast } = useSecurityCheck()
  const { toast } = useToast()
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGrants = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setGrants(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch grants'
      setError(errorMessage)
      toast({
        title: 'Failed to load grants',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createGrant = async (
    grantData: Omit<GrantInsert, 'funder_wallet'>,
    milestones: Omit<MilestoneInsert, 'grant_id'>[]
  ) => {
    if (!requireReady('create grants')) return null
    if (!address || !user) {
      toast({
        title: 'Authentication Error',
        description: 'Please ensure you are properly authenticated',
        variant: 'destructive',
      })
      return null
    }

    // Check if user has funder role
    if (user.role !== 'funder') {
      toast({
        title: 'Permission Denied',
        description: 'Only funders can create grants. Please update your profile role.',
        variant: 'destructive',
      })
      return null
    }

    // Rate limiting check
    if (!checkRateLimitWithToast(address, 'create grants')) {
      return null
    }

    // Validate input data
    try {
      grantSchema.parse({
        ...grantData,
        application_deadline: grantData.application_deadline ? new Date(grantData.application_deadline) : new Date(),
      })
      
      milestones.forEach((milestone, index) => {
        try {
          milestoneSchema.parse({
            ...milestone,
            due_date: milestone.due_date ? new Date(milestone.due_date) : undefined,
          })
        } catch (err) {
          throw new Error(`Milestone ${index + 1} validation failed: ${err instanceof Error ? err.message : 'Invalid data'}`)
        }
      })
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Invalid grant data provided'
      setError(errorMessage)
      toast({
        title: 'Validation Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Create the grant
      const { data: grant, error: grantError } = await supabase
        .from('grants')
        .insert({
          ...grantData,
          funder_wallet: address.toLowerCase(),
          status: 'draft', // Set initial status
        })
        .select()
        .single()

      if (grantError) throw grantError

      // Create milestones
      const milestonesWithGrantId = milestones.map((milestone, index) => ({
        ...milestone,
        grant_id: grant.id,
        order_index: index,
        status: 'pending', // Set initial status
      }))

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestonesWithGrantId)

      if (milestonesError) throw milestonesError

      toast({
        title: 'Grant created successfully!',
        description: `Your grant "${grant.title}" has been created and is ready for deployment.`,
      })

      await fetchGrants()
      return grant
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create grant'
      setError(errorMessage)
      toast({
        title: 'Grant Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchGrantById = async (grantId: string) => {
    try {
      const { data: grant, error: grantError } = await supabase
        .from('grants')
        .select('*')
        .eq('id', grantId)
        .single()

      if (grantError) throw grantError

      const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('grant_id', grantId)
        .order('order_index')

      if (milestonesError) throw milestonesError

      return { grant, milestones }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch grant details'
      toast({
        title: 'Failed to load grant',
        description: errorMessage,
        variant: 'destructive',
      })
      throw new Error(errorMessage)
    }
  }

  const updateGrantStatus = async (grantId: string, status: string) => {
    if (!requireReady('update grant status')) return false

    try {
      const { error } = await supabase
        .from('grants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', grantId)

      if (error) throw error

      toast({
        title: 'Grant updated',
        description: `Grant status updated to ${status}`,
      })

      await fetchGrants()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update grant'
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      })
      return false
    }
  }

  // Auto-fetch grants when user becomes ready
  useEffect(() => {
    fetchGrants()
  }, [])

  // Refetch when user authentication state changes
  useEffect(() => {
    if (isReady) {
      fetchGrants()
    }
  }, [isReady])

  return {
    grants,
    loading,
    error,
    createGrant,
    fetchGrantById,
    updateGrantStatus,
    refetch: fetchGrants,
    
    // Computed values
    userGrants: grants.filter(grant => grant.funder_wallet === address?.toLowerCase()),
    availableGrants: grants.filter(grant => grant.status === 'active' && !grant.grantee_wallet),
  }
}


import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import type { Database } from '@/integrations/supabase/types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export const useUserProfile = () => {
  const { address } = useAccount()
  const { isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (walletAddress: string) => {
    if (!isAuthenticated) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (
    walletAddress: string,
    role: 'funder' | 'grantee' | 'auditor',
    name?: string
  ) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required')
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          role,
          name,
          reputation_score: 0,
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!address || !isAuthenticated) {
      throw new Error('Authentication required')
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('wallet_address', address.toLowerCase())
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && address) {
      fetchProfile(address)
    } else {
      setProfile(null)
    }
  }, [address, isAuthenticated])

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refetch: () => address && isAuthenticated && fetchProfile(address),
  }
}

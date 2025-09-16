
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  wallet_address: string;
  role: 'funder' | 'grantee' | 'auditor';
  name?: string;
  bio?: string;
  reputation_score: number;
  voting_power: number;
  stake_amount: number;
}

type AuthState = 'disconnected' | 'connected' | 'authenticated' | 'profile_required' | 'ready';

export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Clear error when wallet changes
  useEffect(() => {
    setError(null);
  }, [address]);

  // Fetch user profile
  const fetchProfile = useCallback(async (walletAddress: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Database error: ${error.message}`);
      }

      if (data) {
        const profile: AuthUser = {
          id: data.id,
          wallet_address: data.wallet_address,
          role: data.role as 'funder' | 'grantee' | 'auditor',
          name: data.name || undefined,
          bio: data.bio || undefined,
          reputation_score: data.reputation_score || 0,
          voting_power: data.voting_power || 1,
          stake_amount: data.stake_amount || 0,
        };
        setUser(profile);
        return profile;
      }
      
      setUser(null);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      setUser(null);
      return null;
    }
  }, []);

  // Sign message to authenticate
  const signIn = useCallback(async (): Promise<boolean> => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Create authentication message
      const message = `Welcome to GrantChain!

Please sign this message to authenticate your wallet.

Wallet: ${address}
Timestamp: ${new Date().toISOString()}
Nonce: ${Math.random().toString(36).substring(7)}`;

      // Sign the message
      const signature = await signMessageAsync({ 
        message, 
        account: address 
      });

      // Create anonymous session with wallet data
      const { error: authError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            wallet_address: address.toLowerCase(),
            signature,
            message,
            signed_at: new Date().toISOString()
          },
        },
      });

      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      // Fetch profile after successful authentication
      const profile = await fetchProfile(address);
      
      if (profile) {
        setAuthState('ready');
        toast({
          title: 'Welcome back!',
          description: `Signed in as ${profile.name || 'Anonymous'}`,
        });
      } else {
        setAuthState('profile_required');
        toast({
          title: 'Authentication successful',
          description: 'Please complete your profile to continue',
        });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setAuthState('connected');
      
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, signMessageAsync, fetchProfile, toast]);

  // Create user profile
  const createProfile = useCallback(async (profileData: {
    role: 'funder' | 'grantee' | 'auditor';
    name: string;
    bio?: string;
  }): Promise<AuthUser | null> => {
    if (!address || authState !== 'profile_required') {
      setError('Invalid state for profile creation');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          wallet_address: address.toLowerCase(),
          role: profileData.role,
          name: profileData.name.trim(),
          bio: profileData.bio?.trim() || null,
          reputation_score: 0,
          voting_power: 1,
          stake_amount: 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Profile creation failed: ${error.message}`);
      }

      const newProfile: AuthUser = {
        id: data.id,
        wallet_address: data.wallet_address,
        role: data.role as 'funder' | 'grantee' | 'auditor',
        name: data.name,
        bio: data.bio || undefined,
        reputation_score: data.reputation_score || 0,
        voting_power: data.voting_power || 1,
        stake_amount: data.stake_amount || 0,
      };

      setUser(newProfile);
      setAuthState('ready');

      toast({
        title: 'Profile created successfully!',
        description: `Welcome to GrantChain, ${newProfile.name}!`,
      });

      return newProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile creation failed';
      setError(errorMessage);
      
      toast({
        title: 'Profile Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, authState, toast]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
      
      // Set auth state based on wallet connection status
      setAuthState(isConnected ? 'connected' : 'disconnected');
      
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out of GrantChain',
      });
    } catch (err) {
      // Force logout even if Supabase fails
      setUser(null);
      setError(null);
      setAuthState(isConnected ? 'connected' : 'disconnected');
    }
  }, [toast, isConnected]);

  // Handle wallet connection state changes
  useEffect(() => {
    if (!isConnected || !address) {
      setAuthState('disconnected');
      setUser(null);
      setError(null);
      return;
    }

    // Wallet is connected, check if we have an active session
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.user_metadata?.wallet_address?.toLowerCase() === address.toLowerCase()) {
          // We have a valid session for this wallet
          const profile = await fetchProfile(address);
          setAuthState(profile ? 'ready' : 'profile_required');
        } else {
          // No valid session for this wallet
          setAuthState('connected');
        }
      } catch (err) {
        setAuthState('connected');
        setError('Failed to check authentication state');
      }
    };

    checkAuthState();
  }, [isConnected, address, fetchProfile]);

  // Force reset auth state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setAuthState('disconnected');
      setUser(null);
      setError(null);
    }
  }, [isConnected]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthState(isConnected ? 'connected' : 'disconnected');
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isConnected]);

  // Computed values
  const isAuthenticated = authState === 'authenticated' || authState === 'profile_required' || authState === 'ready';
  const requiresProfile = authState === 'profile_required';
  const isReady = authState === 'ready';

  return {
    // State
    user,
    loading,
    error,
    authState,
    
    // Computed
    isAuthenticated,
    requiresProfile,
    isReady,
    
    // Actions
    signIn,
    signOut,
    createProfile,
    
    // Utils
    refetchProfile: () => address ? fetchProfile(address) : Promise.resolve(null),
  };
};

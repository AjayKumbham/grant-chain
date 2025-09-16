
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VotingSession {
  id: string;
  milestone_id: string;
  session_type: string;
  start_time: string;
  end_time: string;
  min_votes_required: number;
  approval_threshold: number;
  status: 'active' | 'completed' | 'cancelled';
  final_result?: 'approved' | 'rejected' | 'inconclusive';
}

interface Vote {
  id: string;
  milestone_id: string;
  voter_wallet: string;
  vote: 'approve' | 'reject';
  reasoning?: string;
  vote_weight: number;
  reputation_weight: number;
  stake_amount: number;
  created_at: string;
}

export const useVoting = (milestoneId?: string) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);

  const fetchVotingSession = async (targetMilestoneId?: string) => {
    const queryMilestoneId = targetMilestoneId || milestoneId;
    if (!queryMilestoneId) return;

    try {
      const { data, error } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('milestone_id', queryMilestoneId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const typedSession: VotingSession = {
          ...data,
          status: data.status as 'active' | 'completed' | 'cancelled',
          final_result: data.final_result as 'approved' | 'rejected' | 'inconclusive' | undefined
        };
        setVotingSession(typedSession);
      } else {
        setVotingSession(null);
      }
    } catch (err) {
      console.error('Error fetching voting session:', err);
    }
  };

  const fetchVotes = async (targetMilestoneId?: string) => {
    const queryMilestoneId = targetMilestoneId || milestoneId;
    if (!queryMilestoneId) return;

    try {
      const { data, error } = await supabase
        .from('milestone_votes')
        .select('*')
        .eq('milestone_id', queryMilestoneId);

      if (error) throw error;

      if (data) {
        const typedVotes: Vote[] = data.map(vote => ({
          ...vote,
          vote: vote.vote as 'approve' | 'reject'
        }));
        setVotes(typedVotes);
        
        if (address) {
          const userVoteData = typedVotes.find(
            v => v.voter_wallet.toLowerCase() === address.toLowerCase()
          );
          setUserVote(userVoteData || null);
        }
      }
    } catch (err) {
      console.error('Error fetching votes:', err);
    }
  };

  const createVotingSession = async (
    targetMilestoneId: string,
    durationHours: number = 72
  ) => {
    if (!address) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + durationHours);

      const { data, error } = await supabase
        .from('voting_sessions')
        .insert({
          milestone_id: targetMilestoneId,
          end_time: endTime.toISOString(),
          min_votes_required: 3,
          approval_threshold: 0.66,
        })
        .select()
        .single();

      if (error) throw error;

      const typedSession: VotingSession = {
        ...data,
        status: data.status as 'active' | 'completed' | 'cancelled',
        final_result: data.final_result as 'approved' | 'rejected' | 'inconclusive' | undefined
      };
      setVotingSession(typedSession);
      
      toast({
        title: "Voting Session Created",
        description: "Community voting has been initiated for this milestone.",
      });

      return typedSession;
    } catch (err) {
      toast({
        title: "Failed to Create Voting Session",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (
    targetMilestoneId: string,
    vote: 'approve' | 'reject',
    reasoning?: string
  ) => {
    if (!address) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      // Get user profile for reputation weight
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('reputation_score, voting_power, stake_amount')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      const voteData = {
        milestone_id: targetMilestoneId,
        voter_wallet: address.toLowerCase(),
        vote,
        reasoning,
        vote_weight: 1,
        reputation_weight: profile?.voting_power || 1,
        stake_amount: profile?.stake_amount || 0,
      };

      const { data, error } = await supabase
        .from('milestone_votes')
        .upsert(voteData, {
          onConflict: 'milestone_id,voter_wallet'
        })
        .select()
        .single();

      if (error) throw error;

      const typedVote: Vote = {
        ...data,
        vote: data.vote as 'approve' | 'reject'
      };
      setUserVote(typedVote);
      await fetchVotes(targetMilestoneId);

      toast({
        title: "Vote Submitted",
        description: `Your ${vote} vote has been recorded.`,
      });

      return typedVote;
    } catch (err) {
      toast({
        title: "Failed to Submit Vote",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const calculateVoteResults = () => {
    if (votes.length === 0) return { approveCount: 0, rejectCount: 0, totalWeight: 0, approvalRate: 0 };

    const approveVotes = votes.filter(v => v.vote === 'approve');
    const rejectVotes = votes.filter(v => v.vote === 'reject');

    const approveWeight = approveVotes.reduce((sum, v) => sum + (v.reputation_weight || 1), 0);
    const rejectWeight = rejectVotes.reduce((sum, v) => sum + (v.reputation_weight || 1), 0);
    const totalWeight = approveWeight + rejectWeight;

    return {
      approveCount: approveVotes.length,
      rejectCount: rejectVotes.length,
      approveWeight,
      rejectWeight,
      totalWeight,
      approvalRate: totalWeight > 0 ? approveWeight / totalWeight : 0,
    };
  };

  useEffect(() => {
    if (milestoneId) {
      fetchVotingSession();
      fetchVotes();
    }
  }, [milestoneId, address]);

  return {
    votingSession,
    votes,
    userVote,
    loading,
    createVotingSession,
    submitVote,
    calculateVoteResults,
    refetch: () => {
      fetchVotingSession();
      fetchVotes();
    },
  };
};


import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useVoting } from '@/hooks/useVoting';
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Scale,
  MessageSquare
} from 'lucide-react';

interface DAOVotingProps {
  milestoneId: string;
  canCreateSession?: boolean;
  isActive?: boolean;
}

export const DAOVoting = ({ 
  milestoneId, 
  canCreateSession = false,
  isActive = true 
}: DAOVotingProps) => {
  const { address, isConnected } = useAccount();
  const {
    votingSession,
    votes,
    userVote,
    loading,
    createVotingSession,
    submitVote,
    calculateVoteResults,
  } = useVoting(milestoneId);

  const [reasoning, setReasoning] = useState('');
  const [showVoteForm, setShowVoteForm] = useState(false);

  const voteResults = calculateVoteResults();
  const isVotingActive = votingSession && votingSession.status === 'active' && 
    new Date(votingSession.end_time) > new Date();

  const handleCreateSession = async () => {
    try {
      await createVotingSession(milestoneId, 72);
    } catch (error) {
      console.error('Failed to create voting session:', error);
    }
  };

  const handleVote = async (vote: 'approve' | 'reject') => {
    try {
      await submitVote(milestoneId, vote, reasoning);
      setReasoning('');
      setShowVoteForm(false);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const remaining = new Date(endTime).getTime() - Date.now();
    if (remaining <= 0) return 'Voting ended';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  if (!isActive) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center text-gray-500">
          <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>DAO voting not available for this milestone</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              DAO Community Voting
            </CardTitle>
            <CardDescription>
              Decentralized milestone approval through community consensus
            </CardDescription>
          </div>
          {votingSession && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeRemaining(votingSession.end_time)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!votingSession ? (
          <div className="text-center py-6">
            <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Voting Session</h3>
            <p className="text-gray-600 mb-4">
              A voting session needs to be created for community review of this milestone.
            </p>
            {canCreateSession && (
              <Button 
                onClick={handleCreateSession}
                disabled={loading}
                className="gap-2"
              >
                <Vote className="w-4 h-4" />
                Start Community Vote
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Voting Results */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{voteResults.approveCount}</div>
                  <div className="text-sm text-gray-500">Approve</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{voteResults.rejectCount}</div>
                  <div className="text-sm text-gray-500">Reject</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{votes.length}</div>
                  <div className="text-sm text-gray-500">Total Votes</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Approval Rate</span>
                  <span>{Math.round(voteResults.approvalRate * 100)}%</span>
                </div>
                <Progress value={voteResults.approvalRate * 100} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Threshold: {Math.round((votingSession.approval_threshold || 0.66) * 100)}%</span>
                  <span>Min votes: {votingSession.min_votes_required}</span>
                </div>
              </div>
            </div>

            {/* User Voting Section */}
            {isConnected && isVotingActive && (
              <div className="border-t pt-4">
                {userVote ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {userVote.vote === 'approve' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        You voted to {userVote.vote} this milestone
                      </span>
                    </div>
                    {userVote.reasoning && (
                      <p className="text-sm text-gray-600 mt-2">{userVote.reasoning}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!showVoteForm ? (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">Cast your vote on this milestone</p>
                        <Button 
                          onClick={() => setShowVoteForm(true)}
                          className="gap-2"
                        >
                          <Vote className="w-4 h-4" />
                          Cast Your Vote
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reasoning">Reasoning (Optional)</Label>
                          <Textarea
                            id="reasoning"
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            placeholder="Explain your decision..."
                            className="mt-2"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleVote('approve')}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleVote('reject')}
                            disabled={loading}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                        <Button
                          onClick={() => setShowVoteForm(false)}
                          variant="outline"
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Vote History */}
            {votes.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Vote History</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {votes.map((vote) => (
                    <div key={vote.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {vote.vote === 'approve' ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="font-mono text-xs">
                          {vote.voter_wallet.slice(0, 6)}...{vote.voter_wallet.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {vote.reasoning && (
                          <MessageSquare className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(vote.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

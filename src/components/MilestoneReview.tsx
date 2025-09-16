
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMilestones } from '@/hooks/useMilestones';
import { DAOVoting } from './DAOVoting';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink,
  Calendar,
  DollarSign,
  Scale
} from 'lucide-react';

interface MilestoneReviewProps {
  milestone: {
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
    proof_description?: string | null;
    proof_url?: string | null;
    submitted_at?: string | null;
    reviewed_at?: string | null;
    reviewer_wallet?: string | null;
    review_notes?: string | null;
    due_date?: string | null;
  };
  canReview?: boolean;
  enableDAOVoting?: boolean;
  onReviewComplete?: () => void;
}

export const MilestoneReview = ({ 
  milestone, 
  canReview = false,
  enableDAOVoting = true,
  onReviewComplete 
}: MilestoneReviewProps) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const { reviewMilestone, loading } = useMilestones();
  
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to review milestones.",
        variant: "destructive",
      });
      return;
    }

    if (status === 'rejected' && !reviewNotes.trim()) {
      toast({
        title: "Review Notes Required",
        description: "Please provide notes explaining why this milestone is being rejected.",
        variant: "destructive",
      });
      return;
    }

    setReviewing(true);

    try {
      await reviewMilestone(milestone.id, status, reviewNotes);

      toast({
        title: `Milestone ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The milestone has been ${status} successfully.`,
      });

      onReviewComplete?.();
    } catch (error) {
      toast({
        title: "Review Failed",
        description: error instanceof Error ? error.message : 'Failed to review milestone',
        variant: "destructive",
      });
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'submitted':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {milestone.title}
              {getStatusBadge(milestone.status)}
            </CardTitle>
            <CardDescription className="mt-2">
              {milestone.description}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-semibold">
              <DollarSign className="w-4 h-4" />
              {formatAmount(milestone.amount)}
            </div>
            {milestone.due_date && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                Due: {formatDate(milestone.due_date)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Proof Submission */}
        {milestone.status === 'submitted' && milestone.proof_description && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-blue-900">Submitted Proof</Label>
            <p className="text-sm text-blue-800 mt-1">{milestone.proof_description}</p>
            {milestone.proof_url && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-blue-600 mt-2"
                onClick={() => window.open(milestone.proof_url!, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Proof File
              </Button>
            )}
            {milestone.submitted_at && (
              <p className="text-xs text-blue-600 mt-2">
                Submitted: {formatDate(milestone.submitted_at)}
              </p>
            )}
          </div>
        )}

        {/* Review Section */}
        {milestone.reviewed_at && milestone.review_notes && (
          <div className={`p-4 rounded-lg ${
            milestone.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <Label className={`text-sm font-medium ${
              milestone.status === 'approved' ? 'text-green-900' : 'text-red-900'
            }`}>
              Review Notes
            </Label>
            <p className={`text-sm mt-1 ${
              milestone.status === 'approved' ? 'text-green-800' : 'text-red-800'
            }`}>
              {milestone.review_notes}
            </p>
            <p className={`text-xs mt-2 ${
              milestone.status === 'approved' ? 'text-green-600' : 'text-red-600'
            }`}>
              Reviewed: {formatDate(milestone.reviewed_at)} by {milestone.reviewer_wallet}
            </p>
          </div>
        )}

        {/* Review Tabs - Traditional vs DAO */}
        {milestone.status === 'submitted' && (canReview || enableDAOVoting) && (
          <Tabs defaultValue={enableDAOVoting ? "dao" : "traditional"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {canReview && (
                <TabsTrigger value="traditional">Direct Review</TabsTrigger>
              )}
              {enableDAOVoting && (
                <TabsTrigger value="dao">
                  <Scale className="w-4 h-4 mr-1" />
                  DAO Voting
                </TabsTrigger>
              )}
            </TabsList>

            {canReview && (
              <TabsContent value="traditional" className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="review_notes">Review Notes</Label>
                  <Textarea
                    id="review_notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your review decision..."
                    className="mt-2"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReview('rejected')}
                    disabled={reviewing || loading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {reviewing ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={() => handleReview('approved')}
                    disabled={reviewing || loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {reviewing ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              </TabsContent>
            )}

            {enableDAOVoting && (
              <TabsContent value="dao" className="border-t pt-4">
                <DAOVoting 
                  milestoneId={milestone.id}
                  canCreateSession={canReview}
                  isActive={milestone.status === 'submitted'}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

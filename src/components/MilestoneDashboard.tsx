
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MilestoneReview } from './MilestoneReview';
import { MilestoneSubmission } from './MilestoneSubmission';
import { useMilestones } from '@/hooks/useMilestones';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Send,
  Eye
} from 'lucide-react';

interface MilestoneDashboardProps {
  grantId: string;
  funderWallet: string;
  granteeWallet?: string | null;
  isGrantActive?: boolean;
}

export const MilestoneDashboard = ({ 
  grantId, 
  funderWallet, 
  granteeWallet,
  isGrantActive = false
}: MilestoneDashboardProps) => {
  const { address, isConnected } = useAccount();
  const { milestones, loading, error, refetch } = useMilestones(grantId);
  const [selectedMilestoneForSubmission, setSelectedMilestoneForSubmission] = useState<string | null>(null);

  const isFunder = address?.toLowerCase() === funderWallet.toLowerCase();
  const isGrantee = address?.toLowerCase() === granteeWallet?.toLowerCase();
  const canReview = isFunder; // Later we can add DAO voting logic here

  const pendingMilestones = milestones.filter(m => m.status === 'pending');
  const submittedMilestones = milestones.filter(m => m.status === 'submitted');
  const approvedMilestones = milestones.filter(m => m.status === 'approved');
  const rejectedMilestones = milestones.filter(m => m.status === 'rejected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const handleSubmissionComplete = () => {
    setSelectedMilestoneForSubmission(null);
    refetch();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading milestones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button onClick={refetch} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{pendingMilestones.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{submittedMilestones.length}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{approvedMilestones.length}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold">{rejectedMilestones.length}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Submission Modal */}
      {selectedMilestoneForSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <MilestoneSubmission
                milestoneId={selectedMilestoneForSubmission}
                milestoneTitle={milestones.find(m => m.id === selectedMilestoneForSubmission)?.title || ''}
                onSubmissionComplete={handleSubmissionComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Milestones Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({milestones.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingMilestones.length})</TabsTrigger>
          <TabsTrigger value="submitted">Review ({submittedMilestones.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedMilestones.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedMilestones.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {milestones.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No milestones found for this grant.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            milestones.map((milestone, index) => (
              <div key={milestone.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Milestone {index + 1}
                  </h3>
                  {isGrantee && milestone.status === 'pending' && isGrantActive && (
                    <Button
                      onClick={() => setSelectedMilestoneForSubmission(milestone.id)}
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Proof
                    </Button>
                  )}
                </div>
                <MilestoneReview
                  milestone={milestone}
                  canReview={canReview}
                  onReviewComplete={refetch}
                />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingMilestones.map((milestone, index) => (
            <div key={milestone.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Milestone {index + 1}</h3>
                {isGrantee && isGrantActive && (
                  <Button
                    onClick={() => setSelectedMilestoneForSubmission(milestone.id)}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Proof
                  </Button>
                )}
              </div>
              <MilestoneReview
                milestone={milestone}
                canReview={canReview}
                onReviewComplete={refetch}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="space-y-4">
              <h3 className="text-lg font-semibold">Milestone {index + 1}</h3>
              <MilestoneReview
                milestone={milestone}
                canReview={canReview}
                onReviewComplete={refetch}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="space-y-4">
              <h3 className="text-lg font-semibold">Milestone {index + 1}</h3>
              <MilestoneReview
                milestone={milestone}
                canReview={false}
                onReviewComplete={refetch}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="space-y-4">
              <h3 className="text-lg font-semibold">Milestone {index + 1}</h3>
              <MilestoneReview
                milestone={milestone}
                canReview={canReview}
                onReviewComplete={refetch}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

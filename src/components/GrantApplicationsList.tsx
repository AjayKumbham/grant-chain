
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type GrantApplication = Database['public']['Tables']['grant_applications']['Row'];

interface GrantApplicationsListProps {
  grantId: string;
  funderWallet: string;
}

export const GrantApplicationsList = ({ grantId, funderWallet }: GrantApplicationsListProps) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});

  const isFunder = address?.toLowerCase() === funderWallet.toLowerCase();

  useEffect(() => {
    fetchApplications();
  }, [grantId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('grant_applications')
        .select('*')
        .eq('grant_id', grantId)
        .order('application_date', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId: string, status: 'approved' | 'rejected') => {
    if (!isFunder) return;

    try {
      const { error } = await supabase
        .from('grant_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewer_wallet: address?.toLowerCase(),
          review_notes: reviewNotes[applicationId] || null,
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Application Reviewed",
        description: `Application has been ${status}.`,
      });

      fetchApplications();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to review application.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No applications submitted yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Applications ({applications.length})</h3>
      
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{application.proposal_title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {application.applicant_wallet.slice(0, 6)}...{application.applicant_wallet.slice(-4)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(application.application_date).toLocaleDateString()}
                  </span>
                  {application.requested_amount && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${application.requested_amount.toLocaleString()}
                    </span>
                  )}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Proposal Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{application.proposal_description}</p>
              </div>

              {application.review_notes && (
                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Review Notes
                  </h4>
                  <p className="text-blue-700 text-sm">{application.review_notes}</p>
                </div>
              )}

              {isFunder && application.status === 'pending' && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review Notes (Optional)
                    </label>
                    <Textarea
                      value={reviewNotes[application.id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [application.id]: e.target.value }))}
                      placeholder="Add notes about your decision..."
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReviewApplication(application.id, 'rejected')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReviewApplication(application.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';

export const GrantApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    proposal_title: '',
    proposal_description: '',
    requested_amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to apply for grants.",
        variant: "destructive",
      });
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Grant ID not found.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('grant_applications')
        .insert({
          grant_id: id,
          applicant_wallet: address.toLowerCase(),
          proposal_title: formData.proposal_title,
          proposal_description: formData.proposal_description,
          requested_amount: formData.requested_amount ? parseFloat(formData.requested_amount) : null,
        });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your grant application has been submitted successfully.",
      });

      navigate(`/grants/${id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit application',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/grants/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Grant
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Apply for Grant
            </CardTitle>
            <CardDescription>
              Submit your proposal to apply for this grant. Make sure to provide detailed information about your project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="proposal_title">Proposal Title *</Label>
                <Input
                  id="proposal_title"
                  value={formData.proposal_title}
                  onChange={(e) => handleInputChange('proposal_title', e.target.value)}
                  placeholder="Enter a clear, descriptive title for your proposal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="proposal_description">Project Description *</Label>
                <Textarea
                  id="proposal_description"
                  value={formData.proposal_description}
                  onChange={(e) => handleInputChange('proposal_description', e.target.value)}
                  placeholder="Describe your project, goals, timeline, and how you plan to achieve the milestones..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="requested_amount">Requested Amount (Optional)</Label>
                <Input
                  id="requested_amount"
                  type="number"
                  step="0.01"
                  value={formData.requested_amount}
                  onChange={(e) => handleInputChange('requested_amount', e.target.value)}
                  placeholder="Enter amount if different from grant total"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/grants/${id}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

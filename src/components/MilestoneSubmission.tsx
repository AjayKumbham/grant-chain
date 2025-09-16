
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';
import { useMilestones } from '@/hooks/useMilestones';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

interface MilestoneSubmissionProps {
  milestoneId: string;
  milestoneTitle: string;
  onSubmissionComplete?: () => void;
}

export const MilestoneSubmission = ({ 
  milestoneId, 
  milestoneTitle, 
  onSubmissionComplete 
}: MilestoneSubmissionProps) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const { submitMilestone, loading } = useMilestones();
  
  const [proofDescription, setProofDescription] = useState('');
  const [proofFiles, setProofFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUploaded = (fileUrl: string, fileName: string) => {
    setProofFiles(prev => [...prev, fileUrl]);
    console.log('File uploaded:', fileName, fileUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to submit milestone proof.",
        variant: "destructive",
      });
      return;
    }

    if (!proofDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of your milestone completion.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      await submitMilestone(milestoneId, {
        proof_description: proofDescription,
        proof_url: proofFiles.length > 0 ? proofFiles[0] : null, // Use first file as primary proof
        attachments: proofFiles, // Store all files in attachments
      });

      toast({
        title: "Milestone Submitted",
        description: "Your milestone proof has been submitted for review.",
      });

      onSubmissionComplete?.();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit milestone',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Submit Milestone Proof
        </CardTitle>
        <CardDescription>
          Provide evidence and documentation for: <strong>{milestoneTitle}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="proof_description">Proof Description *</Label>
            <Textarea
              id="proof_description"
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="Describe what you have accomplished for this milestone, include details about deliverables, outcomes, and any relevant information..."
              className="min-h-[120px] mt-2"
              required
            />
          </div>

          <FileUpload
            onFileUploaded={handleFileUploaded}
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md"
            maxFiles={10}
            bucketName="milestone-proofs"
            className="w-full"
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || loading || !address}
              className="flex-1"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Proof
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

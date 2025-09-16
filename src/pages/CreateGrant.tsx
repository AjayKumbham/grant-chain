import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, X, ArrowRight, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { WalletConnect } from "@/components/WalletConnect";
import { useAccount } from "wagmi";
import { useGrants } from "@/hooks/useGrants";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { useToast } from "@/hooks/use-toast";

const CreateGrant = () => {
  const { isConnected } = useAccount();
  const { createGrant, loading } = useGrants();
  const { contractsDeployed } = useContractInteraction();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    total_amount: "",
    duration_days: "",
    requirements: "",
  });

  const [milestones, setMilestones] = useState([
    { title: "", description: "", amount: "", deliverables: "" }
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: "", deliverables: "" }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = milestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    );
    setMilestones(updated);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a grant.",
        variant: "destructive",
      });
      return;
    }

    if (!contractsDeployed) {
      toast({
        title: "Contracts Not Deployed",
        description: "Smart contracts need to be deployed first. Please check the README for deployment instructions.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!formData.title || !formData.description || !formData.category || 
        !formData.total_amount || !formData.duration_days) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate milestones
    const validMilestones = milestones.filter(m => 
      m.title && m.description && m.amount && m.deliverables
    );

    if (validMilestones.length === 0) {
      toast({
        title: "Milestones Required",
        description: "Please add at least one complete milestone.",
        variant: "destructive",
      });
      return;
    }

    try {
      const grant = await createGrant(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          total_amount: parseInt(formData.total_amount),
          duration_days: parseInt(formData.duration_days),
          status: 'draft',
        },
        validMilestones.map((m, index) => ({
          title: m.title,
          description: m.description,
          amount: parseInt(m.amount),
          deliverables: m.deliverables,
          status: 'pending' as const,
          order_index: index,
        }))
      );

      if (grant) {
        toast({
          title: "Grant Created",
          description: "Your grant has been created successfully!",
        });
        navigate('/grants');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create grant. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Grant Chain
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/grants" className="text-gray-600 hover:text-blue-600 transition-colors">
                Explore Grants
              </Link>
              <Link to="/create" className="text-blue-600 font-medium">
                Create Grant
              </Link>
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Grant</h1>
          <p className="text-lg text-gray-600">
            Launch a transparent, milestone-based funding program with automatic disbursement controls
          </p>
        </div>

        {!isConnected && (
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-4">You need to connect your wallet to create a grant.</p>
              <WalletConnect />
            </CardContent>
          </Card>
        )}

        {!contractsDeployed && isConnected && (
          <Card className="border-0 shadow-lg mb-8 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Smart Contracts Not Deployed</h3>
                  <p className="text-orange-700 mb-4">
                    To create grants on the blockchain, you need to deploy the smart contracts first. 
                    Check the README-DEPLOYMENT.md file for deployment instructions.
                  </p>
                  <div className="text-sm text-orange-600">
                    <p>• Deploy contracts to Sepolia testnet</p>
                    <p>• Update contract addresses in environment variables</p>
                    <p>• Then you can create decentralized grants</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Basic Information</CardTitle>
              <CardDescription>
                Essential details about your grant program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Grant Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Clean Water Initiative in Rural Kenya"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social-impact">Social Impact</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the goals, impact, and importance of this grant program..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="total-amount" className="text-sm font-medium text-gray-700">
                    Total Amount (USDC) *
                  </Label>
                  <Input
                    id="total-amount"
                    type="number"
                    placeholder="50000"
                    value={formData.total_amount}
                    onChange={(e) => updateFormData('total_amount', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                    Duration (Days) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="180"
                    value={formData.duration_days}
                    onChange={(e) => updateFormData('duration_days', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestone Setup */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-gray-900">Milestone Configuration</CardTitle>
                  <CardDescription>
                    Define checkpoints and deliverables for fund release
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {milestones.length} Milestone{milestones.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Milestone {index + 1}
                    </h4>
                    {milestones.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Milestone Title *
                        </Label>
                        <Input
                          placeholder="e.g., Project Planning & Research"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Amount (USDC) *
                        </Label>
                        <Input
                          type="number"
                          placeholder="12500"
                          value={milestone.amount}
                          onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Description *
                      </Label>
                      <Textarea
                        placeholder="Describe what needs to be accomplished in this milestone..."
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Required Deliverables *
                      </Label>
                      <Textarea
                        placeholder="List specific deliverables that grantees must provide for verification..."
                        value={milestone.deliverables}
                        onChange={(e) => updateMilestone(index, 'deliverables', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addMilestone}
                className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Milestone
              </Button>
            </CardContent>
          </Card>

          {/* Governance Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Governance Settings</CardTitle>
              <CardDescription>
                Configure how milestone approvals will be handled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="approval-type" className="text-sm font-medium text-gray-700">
                    Approval Type *
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select approval method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dao-voting">DAO Community Voting</SelectItem>
                      <SelectItem value="designated-reviewers">Designated Reviewers</SelectItem>
                      <SelectItem value="funder-approval">Funder Approval Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voting-period" className="text-sm font-medium text-gray-700">
                    Voting Period (Hours)
                  </Label>
                  <Input
                    id="voting-period"
                    type="number"
                    placeholder="72"
                    defaultValue="72"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">
                  Additional Requirements
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Specify any additional requirements for grantees (e.g., reporting frequency, community engagement, etc.)"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button variant="outline" size="lg" className="px-8">
              Save as Draft
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
              onClick={handleSubmit}
              disabled={loading || !isConnected || !contractsDeployed}
            >
              {loading ? 'Creating...' : 'Create Grant'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGrant;

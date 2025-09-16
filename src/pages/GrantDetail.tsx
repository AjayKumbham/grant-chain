
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, ArrowLeft, ExternalLink, FileText, User, Send } from "lucide-react";
import { useGrants } from "@/hooks/useGrants";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { GrantApplicationsList } from "@/components/GrantApplicationsList";
import { MilestoneDashboard } from "@/components/MilestoneDashboard";
import type { Database } from "@/integrations/supabase/types";
import { NotificationCenter } from "@/components/NotificationCenter";

type Grant = Database['public']['Tables']['grants']['Row'];
type Milestone = Database['public']['Tables']['milestones']['Row'];

const GrantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected } = useAccount();
  const { fetchGrantById } = useGrants();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrantDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await fetchGrantById(id);
        setGrant(data.grant);
        setMilestones(data.milestones);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grant details');
      } finally {
        setLoading(false);
      }
    };

    loadGrantDetails();
  }, [id, fetchGrantById]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-yellow-100 text-yellow-700";
      case "draft": return "bg-gray-100 text-gray-700";
      case "pending": return "bg-gray-100 text-gray-700";
      case "submitted": return "bg-blue-100 text-blue-700";
      case "under_review": return "bg-yellow-100 text-yellow-700";
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Social Impact": return "bg-purple-100 text-purple-700";
      case "Education": return "bg-indigo-100 text-indigo-700";
      case "Environment": return "bg-green-100 text-green-700";
      case "Healthcare": return "bg-red-100 text-red-700";
      case "Technology": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const approvedMilestones = milestones.filter(m => m.status === 'approved').length;
    return (approvedMilestones / milestones.length) * 100;
  };

  const getTotalApprovedAmount = () => {
    return milestones
      .filter(m => m.status === 'approved')
      .reduce((total, m) => total + m.amount, 0);
  };

  const isFunder = address && grant && address.toLowerCase() === grant.funder_wallet.toLowerCase();
  const canApply = isConnected && grant && grant.status === 'active' && !isFunder;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grant details...</p>
        </div>
      </div>
    );
  }

  if (error || !grant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
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
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Grant Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The grant you are looking for does not exist.'}</p>
            <Link to="/grants">
              <Button>Back to Grants</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <Link to="/create" className="text-gray-600 hover:text-blue-600 transition-colors">
                Create Grant
              </Link>
              <NotificationCenter />
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/grants">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Grants
            </Button>
          </Link>
        </div>

        {/* Grant Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={getCategoryColor(grant.category)}>
                  {grant.category}
                </Badge>
                <Badge className={getStatusColor(grant.status || 'draft')}>
                  {(grant.status || 'draft').charAt(0).toUpperCase() + (grant.status || 'draft').slice(1).replace('_', ' ')}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{grant.title}</h1>
              <p className="text-lg text-gray-600">{grant.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">${grant.total_amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Funding</div>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
                  <div className="text-sm text-gray-500">Total Milestones</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {milestones.filter(m => m.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${getTotalApprovedAmount().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Funds Released</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(calculateProgress())}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
              <Progress value={calculateProgress()} className="h-3" />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Milestone Dashboard - Replace the old milestone list */}
            {grant && (
              <MilestoneDashboard
                grantId={grant.id}
                funderWallet={grant.funder_wallet}
                granteeWallet={grant.grantee_wallet}
                isGrantActive={grant.status === 'in_progress' || grant.status === 'active'}
              />
            )}

            {/* Applications Section */}
            {grant && (
              <GrantApplicationsList 
                grantId={grant.id} 
                funderWallet={grant.funder_wallet} 
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Grant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Grant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Funder</div>
                  <div className="text-sm font-mono text-gray-900">
                    {grant.funder_wallet.slice(0, 6)}...{grant.funder_wallet.slice(-4)}
                  </div>
                </div>
                
                {grant.grantee_wallet && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Grantee</div>
                    <div className="text-sm font-mono text-gray-900">
                      {grant.grantee_wallet.slice(0, 6)}...{grant.grantee_wallet.slice(-4)}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500">Duration</div>
                  <div className="text-sm text-gray-900">{grant.duration_days} days</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Created</div>
                  <div className="text-sm text-gray-900">
                    {new Date(grant.created_at!).toLocaleDateString()}
                  </div>
                </div>

                {grant.application_deadline && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Application Deadline</div>
                    <div className="text-sm text-gray-900">
                      {new Date(grant.application_deadline).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canApply && (
                  <Link to={`/grants/${id}/apply`}>
                    <Button className="w-full gap-2">
                      <Send className="w-4 h-4" />
                      Apply to Grant
                    </Button>
                  </Link>
                )}
                {!isConnected && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Connect wallet to apply</p>
                    <WalletConnect />
                  </div>
                )}
                <Button className="w-full" variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  View Funder Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrantDetail;

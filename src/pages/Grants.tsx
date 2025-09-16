
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useGrants } from "@/hooks/useGrants";
import { WalletConnect } from "@/components/WalletConnect";
import { useState } from "react";

const Grants = () => {
  const { grants, loading } = useGrants();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredGrants = grants.filter(grant => {
    const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || grant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-yellow-100 text-yellow-700";
      case "draft": return "bg-gray-100 text-gray-700";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grants...</p>
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
              <Link to="/grants" className="text-blue-600 font-medium">
                Explore Grants
              </Link>
              <Link to="/create" className="text-gray-600 hover:text-blue-600 transition-colors">
                Create Grant
              </Link>
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Active Grants</h1>
          <p className="text-lg text-gray-600">
            Discover transparent, milestone-based funding opportunities across various categories
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search grants by title, description, or category..."
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={statusFilter === "all" ? "default" : "outline"} 
              className="px-4 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Badge>
            <Badge 
              variant={statusFilter === "active" ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Badge>
            <Badge 
              variant={statusFilter === "completed" ? "default" : "outline"}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Active Grants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{grants.filter(g => g.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Funding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${grants.reduce((sum, grant) => sum + grant.total_amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Grants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{grants.filter(g => g.status === 'completed').length}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Draft Grants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{grants.filter(g => g.status === 'draft').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Grants Grid */}
        {filteredGrants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No grants found matching your criteria.</p>
            <Link to="/create">
              <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                Create Your First Grant
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredGrants.map((grant) => (
              <Card key={grant.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(grant.category)}>
                      {grant.category}
                    </Badge>
                    <Badge className={getStatusColor(grant.status)}>
                      {grant.status.charAt(0).toUpperCase() + grant.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-900 leading-tight">
                    {grant.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {grant.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Grant Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Amount:</span>
                      <div className="font-semibold text-gray-900">${grant.total_amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-semibold text-gray-900">{grant.duration_days} days</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Funder:</span>
                      <div className="font-semibold text-blue-600 truncate">
                        {grant.funder_wallet.slice(0, 6)}...{grant.funder_wallet.slice(-4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <div className="font-semibold text-gray-900">
                        {new Date(grant.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link to={`/grants/${grant.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                        View Details
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Grants;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Vote, 
  Coins, 
  FileText, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

export const FeatureGrid = () => {
  const features = [
    {
      icon: Shield,
      title: "Smart Contract Security",
      description: "All grants are secured by audited smart contracts on Ethereum, ensuring transparent and automatic fund distribution.",
      benefits: ["Automated milestone payments", "Immutable agreements", "Zero counterparty risk"],
    },
    {
      icon: Vote,
      title: "Community Governance",
      description: "Decentralized voting system where token holders decide on grant approvals and milestone validations.",
      benefits: ["Democratic decision making", "Reputation-based voting", "Transparent processes"],
    },
    {
      icon: Coins,
      title: "Milestone-Based Funding",
      description: "Funds are released incrementally as project milestones are completed and verified by the community.",
      benefits: ["Reduced funding risk", "Progress accountability", "Flexible payment schedules"],
    },
    {
      icon: FileText,
      title: "IPFS Document Storage",
      description: "All project documents, proposals, and milestone proofs are stored on IPFS for permanent accessibility.",
      benefits: ["Censorship resistant", "Permanent storage", "Version control"],
    },
    {
      icon: Users,
      title: "Multi-Role Platform",
      description: "Support for funders, grantees, and auditors with tailored interfaces and permissions for each role.",
      benefits: ["Role-based access", "Specialized workflows", "Clear responsibilities"],
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and reporting tools to track funding performance and platform metrics.",
      benefits: ["Real-time insights", "Performance tracking", "Data-driven decisions"],
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Platform Features
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need for transparent and efficient grant management
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg transition-all hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/grants">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

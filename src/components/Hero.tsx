
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <Zap className="mr-2 h-4 w-4" />
              Decentralized Grant Management
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Fund Innovation with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GrantChain
              </span>
            </h1>
            
            <p className="mb-8 text-xl text-gray-600 sm:text-2xl">
              A transparent, decentralized platform for managing grants with milestone-based funding, 
              community governance, and automated smart contract execution.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/grants">
                  Explore Grants
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/create-grant">
                  Create Grant
                </Link>
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-600">Transparent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">Smart</div>
                <div className="text-sm text-gray-600">Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">DAO</div>
                <div className="text-sm text-gray-600">Governed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

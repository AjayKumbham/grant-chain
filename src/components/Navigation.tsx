
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";

export const Navigation = () => {
  return (
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
            <Link to="/create-grant" className="text-gray-600 hover:text-blue-600 transition-colors">
              Create Grant
            </Link>
            <Link to="/analytics" className="text-gray-600 hover:text-blue-600 transition-colors">
              Analytics
            </Link>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
};

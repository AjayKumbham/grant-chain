
import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Stats } from "@/components/Stats";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProfileSetup } from "@/components/auth/ProfileSetup";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "wagmi";

const Index = () => {
  const { isConnected } = useAccount();
  const { isAuthenticated, requiresProfile } = useAuth();

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Authentication Section - Show when wallet is connected but not authenticated */}
      {isConnected && !isAuthenticated && (
        <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to GrantChain!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Sign a message to verify your wallet ownership and get started.
            </p>
            <AuthGuard requireProfile={false}>
              <div className="text-center">
                <p className="text-green-600 font-medium">
                  ✅ Authentication successful! You can now use GrantChain features.
                </p>
              </div>
            </AuthGuard>
          </div>
        </div>
      )}

      {/* Profile Setup Section - Show when authenticated but no profile */}
      {isAuthenticated && requiresProfile && (
        <div className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Your Profile
              </h2>
              <p className="text-lg text-gray-600">
                Tell us about yourself to start using GrantChain features.
              </p>
            </div>
            <ProfileSetup />
          </div>
        </div>
      )}

      <Stats />
      <FeatureGrid />
    </div>
  );
};

export default Index;

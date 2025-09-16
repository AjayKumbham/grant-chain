
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Wallet } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireProfile = true 
}) => {
  const { isConnected } = useAccount();
  const { user, loading, isAuthenticated, signIn, requiresProfile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to access GrantChain features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Connect your wallet using the button in the top navigation.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Sign a message to verify your wallet ownership and access GrantChain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signIn} className="w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign Message to Authenticate'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (requireProfile && requiresProfile) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle>Profile Setup Required</CardTitle>
          <CardDescription>
            Create your profile to continue using GrantChain features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Please complete your profile setup to access all features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { WalletConnect } from '@/components/WalletConnect';
import { ProfileSetup } from '@/components/auth/ProfileSetup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Wallet, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export const AuthFlow = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  const { authState, loading, error, signIn } = useAuth();

  // Debug logging
  console.log('AuthFlow render:', { isConnected, authState, loading, error });

  // Show loading state during initial auth check
  if (loading && authState === 'disconnected') {
    return (
      <Card className="max-w-md mx-auto mt-16">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Wallet not connected
  if (!isConnected || authState === 'disconnected') {
    return (
      <Card className="max-w-md mx-auto mt-16">
        <CardHeader className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your Web3 wallet to access GrantChain's decentralized grant platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <WalletConnect />
          <div className="text-xs text-muted-foreground text-center">
            Supported wallets: MetaMask, WalletConnect, and more
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Wallet connected but not authenticated
  if (authState === 'connected') {
    return (
      <Card className="max-w-md mx-auto mt-16">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <CardTitle>Authenticate Your Wallet</CardTitle>
          <CardDescription>
            Sign a message to prove you own this wallet. This doesn't cost any gas fees.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={signIn} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing Message...
              </>
            ) : (
              'Sign Message to Authenticate'
            )}
          </Button>
          <div className="text-xs text-muted-foreground text-center">
            This signature proves you control this wallet address
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Authenticated but needs profile
  if (authState === 'profile_required') {
    return <ProfileSetup />;
  }

  // Step 4: Fully authenticated and ready
  if (authState === 'ready') {
    return <>{children}</>;
  }

  // Fallback for any unexpected state
  return (
    <Card className="max-w-md mx-auto mt-16">
      <CardContent className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4">
          Please refresh the page and try again.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </CardContent>
    </Card>
  );
}; 
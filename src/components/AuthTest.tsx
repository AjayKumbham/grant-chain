import { useAuth } from '@/hooks/useAuth';
import { useAccount, useDisconnect } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const AuthTest = () => {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { authState, user, loading, error, signIn, signOut } = useAuth();

  const forceDisconnect = () => {
    disconnect();
  };

  const forceReset = async () => {
    await signOut();
    disconnect();
    window.location.reload();
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a debug panel to help troubleshoot authentication issues.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Wallet Connected:</strong>
            <Badge variant={isConnected ? "default" : "secondary"} className="ml-2">
              {isConnected ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div>
            <strong>Auth State:</strong>
            <Badge variant="outline" className="ml-2">
              {authState}
            </Badge>
          </div>
          
          <div>
            <strong>Loading:</strong>
            <Badge variant={loading ? "destructive" : "default"} className="ml-2">
              {loading ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div>
            <strong>Has Profile:</strong>
            <Badge variant={user ? "default" : "secondary"} className="ml-2">
              {user ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {connector && (
          <div>
            <strong>Connector:</strong>
            <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
              {connector.name} ({connector.id})
            </code>
          </div>
        )}

        {address && (
          <div>
            <strong>Wallet Address:</strong>
            <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
              {address}
            </code>
          </div>
        )}

        {user && (
          <div className="space-y-2">
            <strong>User Profile:</strong>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div><strong>Name:</strong> {user.name || 'Not set'}</div>
              <div><strong>Role:</strong> {user.role}</div>
              <div><strong>Bio:</strong> {user.bio || 'Not set'}</div>
              <div><strong>Reputation:</strong> {user.reputation_score}</div>
              <div><strong>Voting Power:</strong> {user.voting_power}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {authState === 'connected' && (
            <Button onClick={signIn} disabled={loading}>
              Sign In
            </Button>
          )}
          
          {(authState === 'ready' || authState === 'profile_required') && (
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          )}

          {isConnected && (
            <Button onClick={forceDisconnect} variant="destructive">
              Force Disconnect Wallet
            </Button>
          )}

          <Button onClick={forceReset} variant="secondary">
            Force Reset & Reload
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Expected Flow:</strong> disconnected → connected → authenticated → profile_required → ready
        </div>
      </CardContent>
    </Card>
  );
};
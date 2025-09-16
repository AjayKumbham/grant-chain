
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Wallet, LogOut, User, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const WalletConnect = () => {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { user, signOut, authState } = useAuth()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleConnect = async (connector: any) => {
    setIsConnecting(true)
    try {
      await connect({ connector })
    } catch (error) {
      console.error('Failed to connect:', error)
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      // Disconnect wallet first, then clean up auth state
      disconnect()
      await signOut()
      
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected successfully',
      })
    } catch (error) {
      console.error('Failed to disconnect:', error)
      // Force disconnect even if signOut fails
      disconnect()
      
      toast({
        title: 'Disconnection Error',
        description: 'Wallet disconnected but cleanup failed',
        variant: 'destructive',
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      })
    }
  }

  const openInExplorer = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getAuthStatusBadge = () => {
    switch (authState) {
      case 'ready':
        return <Badge variant="default" className="text-xs">Authenticated</Badge>
      case 'profile_required':
        return <Badge variant="secondary" className="text-xs">Profile Required</Badge>
      case 'connected':
        return <Badge variant="outline" className="text-xs">Sign Required</Badge>
      default:
        return null
    }
  }

  // Debug logging
  console.log('WalletConnect render:', { isConnected, address, authState, user });

  // Connected wallet display
  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
            <User className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-sm">{user?.name || formatAddress(address)}</span>
              {getAuthStatusBadge()}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium">
              {user?.name || 'Wallet Connected'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatAddress(address)}
            </div>
            {user?.role && (
              <div className="text-xs text-muted-foreground capitalize mt-1">
                Role: {user.role}
              </div>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={openInExplorer}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDisconnect} 
            className="text-red-600"
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </DropdownMenuItem>
          
          {connector && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
              Connected via {connector.name}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Connection options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="w-full"
          disabled={isConnecting || isPending}
        >
          {isConnecting || isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium">
          Choose a wallet
        </div>
        <DropdownMenuSeparator />
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.id}
            onClick={() => handleConnect(connector)}
            disabled={isConnecting || isPending}
            className="flex items-center justify-between"
          >
            <span>{connector.name}</span>
            {connector.id === 'metaMask' && (
              <span className="text-xs text-muted-foreground">Recommended</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          New to Web3? Install MetaMask to get started.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

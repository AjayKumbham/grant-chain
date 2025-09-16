
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Use a fallback project ID if not provided
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'GrantChain',
        description: 'Decentralized Grant Management Platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://grantchain.app',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

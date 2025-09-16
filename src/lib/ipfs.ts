
import { NFTStorage, File as NFTFile } from 'nft.storage'

// IPFS client configuration with proper error handling
let client: NFTStorage | null = null

export const initIPFS = async () => {
  if (client) return client

  const apiToken = import.meta.env.VITE_IPFS_API_KEY
  if (!apiToken) {
    console.warn('IPFS API key not configured. Some features may not work.')
    return null
  }

  client = new NFTStorage({ token: apiToken })
  return client
}

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const ipfsClient = await initIPFS()
    if (!ipfsClient) {
      throw new Error('IPFS client not properly authenticated. Please configure VITE_IPFS_API_KEY.')
    }
    // Convert browser File to nft.storage File
    const nftFile = new NFTFile([await file.arrayBuffer()], file.name, { type: file.type })
    const cid = await ipfsClient.storeBlob(nftFile)
    console.log('File uploaded to IPFS:', cid)
    return cid
  } catch (error) {
    console.error('IPFS upload failed:', error)
    if (import.meta.env.DEV) {
      const mockHash = `mock-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`
      console.warn('Using mock IPFS hash for development:', mockHash)
      return mockHash
    }
    throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const uploadJSONToIPFS = async (data: any): Promise<string> => {
  try {
    const ipfsClient = await initIPFS()
    if (!ipfsClient) {
      throw new Error('IPFS client not properly authenticated. Please configure VITE_IPFS_API_KEY.')
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const nftFile = new NFTFile([blob], 'metadata.json', { type: 'application/json' })
    const cid = await ipfsClient.storeBlob(nftFile)
    console.log('JSON uploaded to IPFS:', cid)
    return cid
  } catch (error) {
    console.error('IPFS JSON upload failed:', error)
    if (import.meta.env.DEV) {
      const mockHash = `mock-json-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.warn('Using mock IPFS hash for development:', mockHash)
      return mockHash
    }
    throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const getIPFSUrl = (hash: string): string => {
  if (hash.startsWith('mock-')) {
    return `#mock-ipfs-${hash}`
  }
  // Use nft.storage public gateway
  return `https://nftstorage.link/ipfs/${hash}`
}

export const verifyIPFSContent = async (hash: string, expectedContent: string): Promise<boolean> => {
  if (hash.startsWith('mock-')) {
    console.warn('Skipping IPFS verification for mock hash:', hash)
    return true
  }
  try {
    const response = await fetch(getIPFSUrl(hash))
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const content = await response.text()
    return content === expectedContent
  } catch (error) {
    console.error('IPFS content verification failed:', error)
    return false
  }
}

export const checkIPFSHealth = async (): Promise<{ status: 'healthy' | 'degraded' | 'error', message: string }> => {
  try {
    const ipfsClient = await initIPFS()
    if (!ipfsClient) {
      return {
        status: 'degraded',
        message: 'IPFS client not authenticated. Configure VITE_IPFS_API_KEY for full functionality.'
      }
    }
    return {
      status: 'healthy',
      message: 'IPFS client is properly configured and authenticated.'
    }
  } catch (error) {
    return {
      status: 'error',
      message: `IPFS client error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

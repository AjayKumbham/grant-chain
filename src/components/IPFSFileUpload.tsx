
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, ExternalLink, CheckCircle } from 'lucide-react'
import { uploadToIPFS, getIPFSUrl } from '@/lib/ipfs'
import { useToast } from '@/hooks/use-toast'

interface IPFSFileUploadProps {
  onUploadComplete?: (ipfsHash: string, file: File) => void
  maxSize?: number
  acceptedTypes?: string[]
}

export const IPFSFileUpload = ({ 
  onUploadComplete, 
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', 'text/plain', 'text/markdown']
}: IPFSFileUploadProps) => {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ 
    name: string
    hash: string
    size: number
    type: string
  }>>([])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
        variant: "destructive",
      })
      return
    }

    // Validate file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: "Please select a supported file type",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const ipfsHash = await uploadToIPFS(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      const uploadedFile = {
        name: file.name,
        hash: ipfsHash,
        size: file.size,
        type: file.type
      }

      setUploadedFiles(prev => [...prev, uploadedFile])
      onUploadComplete?.(ipfsHash, file)

      toast({
        title: "Upload Successful",
        description: "File has been uploaded to IPFS and is permanently stored",
      })

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file to IPFS",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset input
      event.target.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          IPFS File Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="ipfs-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept={acceptedTypes.join(',')}
          />
          <label 
            htmlFor="ipfs-upload" 
            className={`cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <div className="text-sm text-gray-600">
                Click to upload or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                Max {(maxSize / 1024 / 1024).toFixed(1)}MB • {acceptedTypes.join(', ')}
              </div>
            </div>
          </label>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading to IPFS...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Uploaded Files</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      IPFS: {file.hash.slice(0, 20)}...
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Stored
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getIPFSUrl(file.hash), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

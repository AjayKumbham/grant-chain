
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, File, X, FileText, Image, Video } from 'lucide-react';

interface FileUploadProps {
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
  accept?: string;
  maxFiles?: number;
  bucketName?: string;
  className?: string;
}

interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const FileUpload = ({ 
  onFileUploaded, 
  accept = "*", 
  maxFiles = 5,
  bucketName = "grant-files",
  className = ""
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      const uploadedFile: UploadedFile = {
        url: publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };

      onFileUploaded?.(publicUrl, file.name);
      return uploadedFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check file limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = fileArray.map(uploadFile);
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter((result): result is UploadedFile => result !== null);
      setUploadedFiles(prev => [...prev, ...successfulUploads]);

      if (successfulUploads.length > 0) {
        toast({
          title: "Upload Successful",
          description: `${successfulUploads.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An error occurred during upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium">Upload Files</Label>
      
      {/* Upload Area */}
      <Card 
        className={`mt-2 border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop files here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Maximum {maxFiles} files
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-sm font-medium">Uploaded Files</Label>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getFileIcon(file.type)}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(file.url, '_blank');
                  }}
                >
                  <File className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Upload, FileText, FileSpreadsheet, File, X, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface ChatFileData {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  preview?: string;
  embeddings?: any[];
}

interface ChatFileUploadProps {
  onFileUploaded: (file: ChatFileData) => void;
  onClose: () => void;
  className?: string;
}

const ChatFileUpload: React.FC<ChatFileUploadProps> = ({ 
  onFileUploaded, 
  onClose, 
  className = '' 
}) => {
  const [uploadStatus, setUploadStatus] = useState({
    uploading: false,
    status: '',
    progress: 0,
    error: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ChatFileData[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        uploading: false,
        status: 'Invalid file type. Please upload PDF, DOCX, or CSV files.',
        progress: 0,
        error: 'Invalid file type'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        uploading: false,
        status: 'File too large. Please upload files smaller than 10MB.',
        progress: 0,
        error: 'File too large'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadStatus({
      uploading: true,
      status: 'Uploading file...',
      progress: 0,
      error: ''
    });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      const response = await fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const newFile: ChatFileData = {
          id: Date.now().toString(),
          filename: file.name,
          fileType: file.type.includes('pdf') ? 'pdf' : file.type.includes('docx') ? 'docx' : 'csv',
          fileSize: file.size,
          uploadDate: new Date(),
          preview: result.data.preview,
          embeddings: result.data.embeddings
        };

        setUploadedFiles(prev => [newFile, ...prev]);
        onFileUploaded(newFile);

        setUploadStatus({
          uploading: false,
          status: 'File uploaded successfully!',
          progress: 100,
          error: ''
        });

        // Reset after 2 seconds
        setTimeout(() => {
          setUploadStatus({
            uploading: false,
            status: '',
            progress: 0,
            error: ''
          });
        }, 2000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        uploading: false,
        status: `Error: ${error instanceof Error ? error.message : 'Upload failed'}`,
        progress: 0,
        error: 'Upload failed'
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'PDF';
      case 'docx':
        return 'Word';
      case 'csv':
        return 'CSV';
      default:
        return 'Document';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[60] ${className}`}>
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Upload File for Chat
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="chat-file-upload"
              className="hidden"
              accept=".pdf,.docx,.csv"
              onChange={handleFileSelect}
            />
            
            <div className="space-y-3">
              <div className="flex justify-center">
                {uploadStatus.uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {uploadStatus.uploading ? 'Processing...' : 'Drop file here or click to upload'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supports PDF, DOCX, and CSV files up to 10MB
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => document.getElementById('chat-file-upload')?.click()}
                disabled={uploadStatus.uploading}
                size="sm"
              >
                Choose File
              </Button>
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus.status && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {uploadStatus.error ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : uploadStatus.progress === 100 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <span className={`text-sm ${uploadStatus.error ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {uploadStatus.status}
                </span>
              </div>
              
              {uploadStatus.uploading && (
                <Progress value={uploadStatus.progress} className="w-full" />
              )}
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-xs">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.fileType)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {file.filename}
                        </p>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Badge variant="secondary" className="text-xs">
                            {getFileTypeLabel(file.fileType)}
                          </Badge>
                          <span>{formatFileSize(file.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => removeFile(file.id)}
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button 
              onClick={onClose} 
              className="flex-1"
              disabled={uploadedFiles.length === 0}
            >
              Use in Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFileUpload;

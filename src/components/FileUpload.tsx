import React, { useState } from 'react';
import { Upload, FileText, FileSpreadsheet, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
  className?: string;
}

interface UploadStatus {
  uploading: boolean;
  processing: boolean;
  status: string;
  progress: number;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, className = '' }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    uploading: false,
    processing: false,
    status: '',
    progress: 0
  });
  const [dragActive, setDragActive] = useState(false);

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
        processing: false,
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
        processing: false,
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
      processing: false,
      status: 'Uploading file...',
      progress: 0
    });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

              const response = await fetch('https://main.d1fx10pzvtm51o.amplifyapp.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUploadStatus({
          uploading: false,
          processing: false,
          status: 'File processed successfully!',
          progress: 100
        });
        
        // Call success callback
        onUploadSuccess(result.data);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setUploadStatus({
            uploading: false,
            processing: false,
            status: '',
            progress: 0
          });
        }, 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        uploading: false,
        processing: false,
        status: `Error: ${error instanceof Error ? error.message : 'Upload failed'}`,
        progress: 0,
        error: 'Upload failed'
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'application/pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'text/csv':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeText = (fileType: string) => {
    switch (fileType) {
      case 'application/pdf':
        return 'PDF Document';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'Word Document';
      case 'text/csv':
        return 'CSV Spreadsheet';
      default:
        return 'Document';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload PDF, DOCX, or CSV files for intelligent processing and AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
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
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.csv"
            onChange={handleFileSelect}
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploadStatus.uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {uploadStatus.uploading ? 'Processing...' : 'Drop files here or click to upload'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Supports PDF, DOCX, and CSV files up to 10MB
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploadStatus.uploading}
              className="mt-4"
            >
              Choose File
            </Button>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus.status && (
          <div className="space-y-3">
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

        {/* Supported Formats */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Supported Formats:</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'application/pdf', label: 'PDF', color: 'text-red-500' },
              { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'DOCX', color: 'text-blue-500' },
              { type: 'text/csv', label: 'CSV', color: 'text-green-500' }
            ].map((format) => (
              <div key={format.type} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {getFileIcon(format.type)}
                <span>{format.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;


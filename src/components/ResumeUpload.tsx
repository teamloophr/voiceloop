import React, { useState } from 'react';
import { Upload, FileText, File, X, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface ResumeData {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  employeeId?: string;
  employeeName?: string;
  preview?: string;
  embeddings?: any[];
  documentId?: string; // Supabase document ID
}

interface ResumeUploadProps {
  employeeId?: string;
  employeeName?: string;
  onResumeUploaded: (resume: ResumeData) => void;
  className?: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ 
  employeeId, 
  employeeName, 
  onResumeUploaded, 
  className = '' 
}) => {
  const [uploadStatus, setUploadStatus] = useState({
    uploading: false,
    status: '',
    progress: 0,
    error: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploadedResumes, setUploadedResumes] = useState<ResumeData[]>([]);

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
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        uploading: false,
        status: 'Invalid file type. Please upload PDF or DOCX files.',
        progress: 0,
        error: 'Invalid file type'
      });
      return;
    }

    // Validate file size (5MB limit for resumes)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        uploading: false,
        status: 'File too large. Please upload files smaller than 5MB.',
        progress: 0,
        error: 'File too large'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadStatus({
      uploading: true,
      status: 'Uploading resume...',
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
                 const newResume: ResumeData = {
           id: Date.now().toString(),
           filename: file.name,
           fileType: file.type.includes('pdf') ? 'pdf' : 'docx',
           fileSize: file.size,
           uploadDate: new Date(),
           employeeId,
           employeeName,
           preview: result.data.preview,
           embeddings: result.data.embeddings,
           documentId: result.data.id // Store the Supabase document ID
         };

        setUploadedResumes(prev => [newResume, ...prev]);
        onResumeUploaded(newResume);

        setUploadStatus({
          uploading: false,
          status: 'Resume uploaded successfully!',
          progress: 100,
          error: ''
        });

        // Reset after 3 seconds
        setTimeout(() => {
          setUploadStatus({
            uploading: false,
            status: '',
            progress: 0,
            error: ''
          });
        }, 3000);
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
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'PDF';
      case 'docx':
        return 'Word';
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

  const removeResume = (id: string) => {
    setUploadedResumes(prev => prev.filter(resume => resume.id !== id));
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume & Documents
        </CardTitle>
        <CardDescription>
          Upload resumes and documents for {employeeName || 'employees'}. Supports PDF and DOCX files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
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
            id="resume-upload"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
          />
          
          <div className="space-y-3">
            <div className="flex justify-center">
              {uploadStatus.uploading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              ) : (
                <Upload className="h-10 w-10 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {uploadStatus.uploading ? 'Processing...' : 'Drop resume here or click to upload'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Supports PDF and DOCX files up to 5MB
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => document.getElementById('resume-upload')?.click()}
              disabled={uploadStatus.uploading}
              size="sm"
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

        {/* Uploaded Resumes */}
        {uploadedResumes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Uploaded Documents ({uploadedResumes.length})
            </h4>
            <div className="space-y-2">
              {uploadedResumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(resume.fileType)}
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {resume.filename}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {getFileTypeLabel(resume.fileType)}
                        </Badge>
                        <span>{formatFileSize(resume.fileSize)}</span>
                        <span>{resume.uploadDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => removeResume(resume.id)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;

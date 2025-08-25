import React, { useState } from 'react';
import { FileText, Bot, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import FileUpload from './FileUpload';
import RAGQuery from './RAGQuery';

interface DocumentData {
  id: string;
  type: string;
  filename: string;
  text_length?: number;
  chunks_count?: number;
  embeddings_count: number;
  preview?: string;
  embeddings: any[];
  summary?: any;
}

const DocumentAnalysis: React.FC = () => {
  const [uploadedDocument, setUploadedDocument] = useState<DocumentData | null>(null);
  const [showUpload, setShowUpload] = useState(true);

  const handleUploadSuccess = (data: DocumentData) => {
    setUploadedDocument(data);
    setShowUpload(false);
  };

  const handleNewUpload = () => {
    setUploadedDocument(null);
    setShowUpload(true);
  };

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setShowUpload(true);
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'csv':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'docx':
        return 'Word Document';
      case 'csv':
        return 'CSV Spreadsheet';
      default:
        return 'Document';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Document Analysis & AI Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload your documents and get intelligent insights using AI-powered analysis. 
          Supports PDF, Word documents, and CSV files with advanced RAG capabilities.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Upload or Document Info */}
        <div className="space-y-6">
          {showUpload ? (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          ) : uploadedDocument ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getFileTypeIcon(uploadedDocument.type)}
                    <div>
                      <CardTitle className="text-lg">{uploadedDocument.filename}</CardTitle>
                      <CardDescription>
                        {getFileTypeLabel(uploadedDocument.type)}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveDocument}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {uploadedDocument.embeddings_count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Text Chunks</p>
                  </div>
                  {uploadedDocument.text_length && (
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {uploadedDocument.text_length.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
                    </div>
                  )}
                </div>

                {/* CSV Summary */}
                {uploadedDocument.type === 'csv' && uploadedDocument.summary && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Data Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Columns:</span>
                        <span className="ml-2 font-medium">{uploadedDocument.summary.columns?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Rows:</span>
                        <span className="ml-2 font-medium">{uploadedDocument.summary.row_count || 0}</span>
                      </div>
                    </div>
                    {uploadedDocument.summary.columns && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Columns:</p>
                        <div className="flex flex-wrap gap-1">
                          {uploadedDocument.summary.columns.slice(0, 6).map((col: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                          {uploadedDocument.summary.columns.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{uploadedDocument.summary.columns.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Document Preview */}
                {uploadedDocument.preview && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Document Preview</h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                      {uploadedDocument.preview}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleNewUpload} variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right Column - RAG Query or Upload Prompt */}
        <div className="space-y-6">
          {uploadedDocument ? (
                         <RAGQuery
               documentId={uploadedDocument.id}
               filename={uploadedDocument.filename}
               fileType={uploadedDocument.type}
             />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Ready for AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload a document to start asking questions and get intelligent insights
                </p>
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-center">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">1. Upload Document</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag & drop or select PDF, DOCX, or CSV files up to 10MB
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">2. AI Processing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic text extraction, chunking, and vector embedding generation
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">3. Intelligent Q&A</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions and get AI-powered answers based on your document content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalysis;


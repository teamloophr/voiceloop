import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileText, FileSpreadsheet, X, Save, Trash2, Brain, AlertCircle } from 'lucide-react'
import { documentProcessingService, DocumentAnalysis } from '@/services/documentProcessingService'

interface DocumentUploaderProps {
  onDocumentAnalyzed: (analysis: DocumentAnalysis) => void
  onSaveForRAG: (documentId: string) => void
  className?: string
}

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'analyzing' | 'analyzed' | 'error'
  analysis?: DocumentAnalysis
  error?: string
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls']
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
  if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />
  if (fileType.includes('excel') || fileType.includes('csv')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />
  return <FileText className="h-5 w-5 text-gray-500" />
}

const getFileTypeLabel = (fileType: string) => {
  if (fileType.includes('pdf')) return 'PDF Document'
  if (fileType.includes('word') || fileType.includes('doc')) return 'Word Document'
  if (fileType.includes('excel') || fileType.includes('csv')) return 'Spreadsheet'
  return 'Document'
}

export const SmartDocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentAnalyzed,
  onSaveForRAG,
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Process each file
    for (const fileData of newFiles) {
      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50))
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileData.id 
                ? { ...f, progress: i }
                : f
            )
          )
        }

        // Update status to processing
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'processing' }
              : f
          )
        )

        // Process and analyze document with real service
        const analysis = await documentProcessingService.processDocument(fileData.file, {
          extractText: true,
          analyzeContent: true,
          generateEmbeddings: false // We'll do this when saving to RAG
        })
        
        // Update with analysis results
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'analyzed', analysis }
              : f
          )
        )

        // Notify parent component
        onDocumentAnalyzed(analysis)

        toast({
          title: "Document Analyzed!",
          description: `"${fileData.file.name}" has been processed and analyzed by AI.`,
        })

      } catch (error) {
        console.error('Error processing file:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'error', error: errorMessage }
              : f
          )
        )
        
        toast({
          title: "Processing Failed",
          description: `Failed to process "${fileData.file.name}": ${errorMessage}`,
          variant: "destructive",
        })
      }
    }
  }, [onDocumentAnalyzed, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleSaveForRAG = async (fileId: string) => {
    const fileData = uploadedFiles.find(f => f.id === fileId)
    if (fileData && fileData.analysis) {
      try {
        // Save to RAG system
        const success = await documentProcessingService.saveToRAG(fileId, fileData.analysis)
        
        if (success) {
          onSaveForRAG(fileId)
          toast({
            title: "Document Saved for RAG",
            description: `"${fileData.file.name}" has been added to your knowledge base.`,
          })
        } else {
          toast({
            title: "RAG Save Failed",
            description: `Failed to save "${fileData.file.name}" to RAG system.`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error saving to RAG:', error)
        toast({
          title: "RAG Save Failed",
          description: `Error saving document to RAG: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Smart Document Upload
          </CardTitle>
          <CardDescription>
            Upload documents for AI analysis. The assistant will analyze content and suggest if it should be saved for RAG.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop documents here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400">
              Supports PDF, DOCX, CSV, XLSX (Max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Document Analysis Results
            </CardTitle>
            <CardDescription>
              Review AI analysis and decide which documents to save for RAG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((fileData) => (
                <div key={fileData.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(fileData.file.type)}
                      <div>
                        <p className="font-medium">{fileData.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {getFileTypeLabel(fileData.file.type)} • {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileData.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {fileData.status === 'uploading' && (
                    <div className="mb-3">
                      <Progress value={fileData.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Uploading... {fileData.progress}%</p>
                    </div>
                  )}

                  {/* Processing Status */}
                  {fileData.status === 'processing' && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Processing document content...</span>
                      </div>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {fileData.status === 'analyzed' && fileData.analysis && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-2">AI Analysis Summary</h4>
                        <p className="text-sm text-gray-700 mb-2">{fileData.analysis.summary}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {fileData.analysis.documentType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {fileData.analysis.estimatedChunks} chunks
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(fileData.analysis.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {fileData.analysis.wordCount} words
                          </Badge>
                          {fileData.analysis.category && (
                            <Badge variant="outline" className="text-xs">
                              {fileData.analysis.category}
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-gray-600">
                          <p className="font-medium mb-1">Key Points:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {fileData.analysis.keyPoints.map((point: string, index: number) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>

                        {fileData.analysis.tags && fileData.analysis.tags.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium text-xs mb-1">Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {fileData.analysis.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 p-2 bg-white rounded border text-xs text-gray-600">
                          <p className="font-medium mb-1">Content Preview:</p>
                          <p className="font-mono">{fileData.analysis.extractedText}</p>
                        </div>

                        <div className="mt-3 p-2 bg-blue-50 rounded border text-xs text-blue-700">
                          <p className="font-medium mb-1">💡 RAG Recommendation:</p>
                          <p>
                            {fileData.analysis.relevanceScore > 0.7 
                              ? `This document has a high relevance score (${(fileData.analysis.relevanceScore * 100).toFixed(0)}%) and is recommended for your knowledge base.`
                              : `This document has a moderate relevance score (${(fileData.analysis.relevanceScore * 100).toFixed(0)}%). Consider if it adds value to your knowledge base.`
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveForRAG(fileData.id)}
                          className="flex-1"
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save for RAG
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(fileData.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Error Status */}
                  {fileData.status === 'error' && (
                    <div className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fileData.error || 'Failed to process document. Please try again.'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

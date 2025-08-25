import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SmartDocumentUploader } from './SmartDocumentUploader'
import { Upload, FileText, Brain, MessageSquare } from 'lucide-react'

interface ChatDocumentModalProps {
  onDocumentAnalyzed: (analysis: any) => void
  onSaveForRAG: (documentId: string) => void
  trigger?: React.ReactNode
}

export const ChatDocumentModal: React.FC<ChatDocumentModalProps> = ({
  onDocumentAnalyzed,
  onSaveForRAG,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')

  const handleDocumentAnalyzed = (analysis: any) => {
    onDocumentAnalyzed(analysis)
    // Keep modal open so user can review and decide
  }

  const handleSaveForRAG = (documentId: string) => {
    onSaveForRAG(documentId)
    // Could close modal here if desired
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Upload className="h-4 w-4" />
      Upload Document
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Smart Document Analysis
          </DialogTitle>
          <DialogDescription>
            Upload documents for AI analysis and decide whether to save them for RAG (Retrieval Augmented Generation)
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload & Analyze
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              How It Works
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <SmartDocumentUploader
              onDocumentAnalyzed={handleDocumentAnalyzed}
              onSaveForRAG={handleSaveForRAG}
            />
          </TabsContent>

          <TabsContent value="info" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Document Upload
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">PDF</Badge>
                    <span>Portable Document Format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">DOCX</Badge>
                    <span>Microsoft Word documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">CSV</Badge>
                    <span>Comma-separated values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">XLSX</Badge>
                    <span>Microsoft Excel spreadsheets</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-600" />
                  AI Analysis
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Content summarization</li>
                  <li>• Key points extraction</li>
                  <li>• Document type detection</li>
                  <li>• Chunk estimation for RAG</li>
                  <li>• Confidence scoring</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                RAG Integration
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  When you save a document for RAG, it becomes part of your knowledge base. The AI assistant can then:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Answer questions based on document content</li>
                  <li>• Provide context-aware responses</li>
                  <li>• Reference specific information from your documents</li>
                  <li>• Learn from your organization's knowledge</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => setActiveTab('upload')}
                className="flex-1"
              >
                Start Uploading
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

import React, { useState } from 'react';
import { Send, Bot, FileText, Loader2, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface RAGQueryProps {
  documentId: string;
  filename: string;
  fileType: string;
  className?: string;
}

interface QueryResult {
  query: string;
  answer: string;
  relevantChunks: any[];
  contextUsed: string;
  timestamp: Date;
}

const RAGQuery: React.FC<RAGQueryProps> = ({ 
  documentId, 
  filename, 
  fileType, 
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [error, setError] = useState<string>('');

  const handleQuery = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/files/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          document_id: documentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const newResult: QueryResult = {
          query: query.trim(),
          answer: result.answer,
          relevantChunks: result.relevant_chunks || [],
          contextUsed: result.context_used || '',
          timestamp: new Date(),
        };

        setResults(prev => [newResult, ...prev]);
        setQuery('');
      } else {
        throw new Error(result.error || 'Query failed');
      }
    } catch (error) {
      console.error('Query error:', error);
      setError(error instanceof Error ? error.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'csv':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
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

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Document Analysis
        </CardTitle>
        <CardDescription>
          Ask questions about your uploaded document using AI-powered analysis
        </CardDescription>
        
        {/* Document Info */}
        <div className="flex items-center gap-2 pt-2">
          {getFileIcon(fileType)}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filename}
          </span>
          <Badge variant="secondary" className="text-xs">
            {getFileTypeLabel(fileType)}
          </Badge>
                     <Badge variant="outline" className="text-xs">
             Document ID: {documentId.slice(0, 8)}...
           </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Query Input */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your document... (e.g., 'What is the main topic?', 'Summarize the key points', 'What are the main findings?')"
              className="pr-12 resize-none"
              rows={3}
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={handleQuery}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 h-8 w-8 p-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Analysis Results
            </h4>
            
            {results.map((result, index) => (
              <div key={index} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                {/* Query */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question:
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {result.query}
                  </p>
                </div>
                
                {/* Answer */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI Answer:
                  </p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {result.answer}
                    </p>
                  </div>
                </div>
                
                {/* Relevant Chunks */}
                {result.relevantChunks && result.relevantChunks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relevant Document Sections:
                    </p>
                    <div className="space-y-2">
                      {result.relevantChunks.slice(0, 3).map((chunk, chunkIndex) => (
                        <div key={chunkIndex} className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                            {chunk.text}
                          </p>
                          {chunk.similarity && (
                            <p className="text-gray-500 text-xs mt-1">
                              Relevance: {(chunk.similarity * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Timestamp */}
                <div className="text-xs text-gray-500 text-right">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              Start by asking a question about your document to see AI-powered analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RAGQuery;


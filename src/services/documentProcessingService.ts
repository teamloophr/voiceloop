import { openaiService } from './openaiService';

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  documentType: string;
  estimatedChunks: number;
  confidence: number;
  contentLength: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  fileName: string;
  fileSize: number;
  extractedText: string;
  tags: string[];
  category: string;
  relevanceScore: number;
}

export interface ProcessingOptions {
  extractText?: boolean;
  analyzeContent?: boolean;
  generateEmbeddings?: boolean;
  saveToRAG?: boolean;
}

class DocumentProcessingService {
  constructor() {
    // No API base URL needed for now - we'll process locally
  }

  /**
   * Process a document file and return analysis
   */
  async processDocument(file: File, options: ProcessingOptions = {}): Promise<DocumentAnalysis> {
    try {
      // Step 1: Extract text content
      const textContent = await this.extractTextFromFile(file);
      
      // Step 2: Analyze content with AI
      const analysis = await this.analyzeContentWithAI(textContent, file);
      
      return analysis;
    } catch (error) {
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text content from various file types
   */
  private async extractTextFromFile(file: File): Promise<string> {
    try {
      // For CSV files, we can extract text directly
      if (file.type === 'text/csv') {
        return await file.text();
      }

      // For now, use simulated extraction for all file types
      // In production, you'd integrate with proper libraries:
      // - PDF: pdf-parse, pdf2pic
      // - DOCX: mammoth, docx
      // - XLSX: xlsx, exceljs
      
      return this.simulateTextExtraction(file);
    } catch (error) {
      console.warn('Text extraction failed, using fallback:', error);
      return this.simulateTextExtraction(file);
    }
  }

  /**
   * Analyze content using AI
   */
  private async analyzeContentWithAI(textContent: string, file: File): Promise<DocumentAnalysis> {
    try {
      // Try to use OpenAI for real analysis
      if (openaiService.isConfigured()) {
        return await this.analyzeWithOpenAI(textContent, file);
      }
      
      // Fallback to intelligent analysis
      return this.intelligentContentAnalysis(textContent, file);
    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error);
      return this.intelligentContentAnalysis(textContent, file);
    }
  }

  /**
   * Use OpenAI for content analysis
   */
  private async analyzeWithOpenAI(textContent: string, file: File): Promise<DocumentAnalysis> {
    const prompt = `Analyze the following document content and provide a comprehensive analysis:

Document: ${file.name}
Type: ${file.type}
Content: ${textContent.substring(0, 4000)}${textContent.length > 4000 ? '...' : ''}

Please provide:
1. A concise summary (2-3 sentences)
2. 4 key points or insights
3. Document category (resume, policy, report, contract, etc.)
4. Relevance score (0-1) for organizational knowledge
5. Suggested tags for categorization

Format as JSON:
{
  "summary": "string",
  "keyPoints": ["string", "string", "string", "string"],
  "category": "string",
  "relevanceScore": 0.8,
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await openaiService.chatCompletion([
      { role: 'user', content: prompt }
    ]);

    if (response.error) {
      throw new Error(`OpenAI analysis failed: ${response.error}`);
    }

    const aiAnalysis = JSON.parse(response.content || '{}');
    
    // Calculate additional metrics
    const words = textContent.split(/\s+/);
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      summary: aiAnalysis.summary || this.generateIntelligentSummary(textContent, file.name),
      keyPoints: aiAnalysis.keyPoints || this.extractKeyPoints(textContent, file.type),
      documentType: this.getFileTypeLabel(file.type),
      estimatedChunks: Math.max(1, Math.floor(textContent.length / 1000)),
      confidence: aiAnalysis.relevanceScore || this.calculateConfidence(textContent, file.size),
      contentLength: textContent.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      fileName: file.name,
      fileSize: file.size,
      extractedText: textContent.substring(0, 200) + '...',
      tags: aiAnalysis.tags || [],
      category: aiAnalysis.category || 'general',
      relevanceScore: aiAnalysis.relevanceScore || 0.7
    };
  }

  /**
   * Fallback intelligent content analysis
   */
  private intelligentContentAnalysis(textContent: string, file: File): DocumentAnalysis {
    const words = textContent.split(/\s+/);
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      summary: this.generateIntelligentSummary(textContent, file.name),
      keyPoints: this.extractKeyPoints(textContent, file.type),
      documentType: this.getFileTypeLabel(file.type),
      estimatedChunks: Math.max(1, Math.floor(textContent.length / 1000)),
      confidence: this.calculateConfidence(textContent, file.size),
      contentLength: textContent.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      fileName: file.name,
      fileSize: file.size,
      extractedText: textContent.substring(0, 200) + '...',
      tags: this.extractTags(textContent, file.type),
      category: this.categorizeDocument(textContent, file.name),
      relevanceScore: this.calculateRelevanceScore(textContent, file.size)
    };
  }

  /**
   * Save document to RAG system (simulated for now)
   */
  async saveToRAG(documentId: string, analysis: DocumentAnalysis): Promise<boolean> {
    try {
      // For now, we'll simulate saving to RAG
      // In production, this would save to your Supabase RAG system
      console.log('Saving document to RAG:', {
        documentId,
        fileName: analysis.fileName,
        category: analysis.category,
        relevanceScore: analysis.relevanceScore
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for demo purposes
      const savedDocuments = JSON.parse(localStorage.getItem('rag_documents') || '[]');
      savedDocuments.push({
        id: documentId,
        analysis,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('rag_documents', JSON.stringify(savedDocuments));

      return true;
    } catch (error) {
      console.error('Failed to save to RAG:', error);
      return false;
    }
  }

  /**
   * Get all saved RAG documents
   */
  getSavedDocuments(): any[] {
    try {
      return JSON.parse(localStorage.getItem('rag_documents') || '[]');
    } catch (error) {
      console.error('Failed to get saved documents:', error);
      return [];
    }
  }

  // Helper methods
  private simulateTextExtraction(file: File): string {
    const fileName = file.name.split('.')[0];
    
    // Simulate different content based on file type and name
    if (file.type.includes('pdf')) {
      if (fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
        return `John Doe - Senior Software Engineer

PROFESSIONAL SUMMARY
Experienced software engineer with 8+ years developing scalable web applications using modern technologies. Proven track record of leading development teams and delivering high-quality software solutions.

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
• Led development of microservices architecture serving 1M+ users
• Mentored junior developers and conducted code reviews
• Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer | StartupXYZ | 2018-2020
• Developed REST APIs and frontend components using React/Node.js
• Collaborated with product team to define technical requirements
• Participated in agile development process with 2-week sprints

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2018

SKILLS
Programming: JavaScript, Python, Java, Go
Frameworks: React, Node.js, Django, Spring Boot
Databases: PostgreSQL, MongoDB, Redis
Cloud: AWS, Docker, Kubernetes`;
      } else {
        return `This PDF document contains information about ${fileName}. It appears to be a comprehensive report with multiple sections covering various topics related to ${fileName}. The document includes detailed analysis, data tables, and conclusions that could be valuable for future reference.`;
      }
    } else if (file.type.includes('word') || file.type.includes('doc')) {
      if (fileName.toLowerCase().includes('policy')) {
        return `Company Policy Document

POLICY TITLE: Remote Work Policy
EFFECTIVE DATE: January 1, 2024
DEPARTMENT: Human Resources

PURPOSE
This policy establishes guidelines for remote work arrangements to ensure productivity, communication, and work-life balance for all employees.

SCOPE
This policy applies to all full-time and part-time employees who are approved for remote work arrangements.

REMOTE WORK ELIGIBILITY
• Employees must have completed 90 days of employment
• Performance must meet or exceed expectations
• Home office must meet minimum requirements
• Manager approval required

REMOTE WORK SCHEDULE
• Standard business hours apply (9:00 AM - 5:00 PM)
• Flexibility allowed with manager approval
• Must be available for meetings and collaboration
• Regular check-ins required

EXPECTATIONS
• Maintain same productivity standards as office work
• Respond to communications within 2 hours
• Attend all scheduled meetings and training sessions
• Keep work area professional and secure`;
      } else {
        return `This Word document titled "${fileName}" contains structured content with headings, paragraphs, and potentially formatted text. It appears to be a document that could contain important information, policies, or reports that might be useful for the organization's knowledge base.`;
      }
    } else if (file.type.includes('excel') || file.type.includes('csv')) {
      return `This spreadsheet document "${fileName}" contains tabular data with rows and columns. It likely includes numerical information, statistics, or structured data that could be valuable for analysis, reporting, or decision-making processes.`;
    }
    
    return `Document content extracted from ${fileName}. This appears to be a ${this.getFileTypeLabel(file.type)} that may contain valuable information for the organization.`;
  }

  private generateIntelligentSummary(content: string, fileName: string): string {
    const fileNameLower = fileName.toLowerCase();
    
    if (content.includes('resume') || content.includes('CV') || fileNameLower.includes('resume') || fileNameLower.includes('cv')) {
      return `This appears to be a resume/CV document for ${fileName.split('_')[0] || 'a candidate'}. It contains professional information that could be valuable for HR processes and candidate evaluation.`;
    }
    
    if (content.includes('policy') || content.includes('procedure') || content.includes('guideline')) {
      return `This document contains organizational policies, procedures, or guidelines. It's important for maintaining consistency and compliance across the organization.`;
    }
    
    if (content.includes('report') || content.includes('analysis') || content.includes('data')) {
      return `This appears to be a report or analysis document containing data and insights. It could be valuable for decision-making and strategic planning.`;
    }
    
    if (content.includes('contract') || content.includes('agreement') || content.includes('legal')) {
      return `This document appears to be a legal document, contract, or agreement. It contains important terms and conditions that should be preserved for legal compliance.`;
    }
    
    return `This document contains valuable information that could enhance the organization's knowledge base. The content appears to be well-structured and comprehensive.`;
  }

  private extractKeyPoints(content: string, fileType: string): string[] {
    const points: string[] = [];
    
    if (content.includes('resume') || content.includes('CV')) {
      points.push('Professional experience and qualifications');
      points.push('Contact information and personal details');
      points.push('Skills and certifications');
      points.push('Educational background');
    } else if (content.includes('policy') || content.includes('procedure')) {
      points.push('Organizational guidelines and standards');
      points.push('Process workflows and procedures');
      points.push('Compliance requirements');
      points.push('Best practices and recommendations');
    } else if (content.includes('report') || content.includes('analysis')) {
      points.push('Data insights and findings');
      points.push('Statistical information and metrics');
      points.push('Conclusions and recommendations');
      points.push('Methodology and approach');
    } else if (content.includes('contract') || content.includes('agreement')) {
      points.push('Legal terms and conditions');
      points.push('Parties involved and obligations');
      points.push('Timeline and deadlines');
      points.push('Financial terms and payment details');
    } else {
      points.push('Structured information and data');
      points.push('Professional documentation');
      points.push('Organizational knowledge');
      points.push('Reference material');
    }
    
    return points.slice(0, 4);
  }

  private calculateConfidence(content: string, fileSize: number): number {
    let confidence = 0.7;
    
    if (content.length > 1000) confidence += 0.1;
    if (content.length > 5000) confidence += 0.1;
    if (fileSize > 100 * 1024) confidence += 0.05;
    if (fileSize > 500 * 1024) confidence += 0.05;
    if (content.includes('\n\n')) confidence += 0.05;
    if (content.match(/[A-Z][a-z]+/)) confidence += 0.05;
    
    return Math.min(0.95, confidence);
  }

  private extractTags(content: string, fileType: string): string[] {
    const tags: string[] = [];
    
    if (content.includes('resume') || content.includes('CV')) tags.push('resume', 'hr', 'candidate');
    if (content.includes('policy')) tags.push('policy', 'compliance', 'guidelines');
    if (content.includes('report')) tags.push('report', 'analysis', 'data');
    if (content.includes('contract')) tags.push('contract', 'legal', 'agreement');
    if (fileType.includes('pdf')) tags.push('pdf');
    if (fileType.includes('word')) tags.push('word', 'document');
    if (fileType.includes('excel') || fileType.includes('csv')) tags.push('spreadsheet', 'data');
    
    return tags;
  }

  private categorizeDocument(content: string, fileName: string): string {
    if (content.includes('resume') || content.includes('CV')) return 'resume';
    if (content.includes('policy') || content.includes('procedure')) return 'policy';
    if (content.includes('report') || content.includes('analysis')) return 'report';
    if (content.includes('contract') || content.includes('agreement')) return 'contract';
    return 'general';
  }

  private calculateRelevanceScore(content: string, fileSize: number): number {
    let score = 0.5;
    
    if (content.length > 1000) score += 0.1;
    if (content.length > 5000) score += 0.1;
    if (fileSize > 100 * 1024) score += 0.1;
    if (content.includes('policy') || content.includes('procedure')) score += 0.2;
    if (content.includes('report') || content.includes('analysis')) score += 0.15;
    if (content.includes('contract') || content.includes('agreement')) score += 0.2;
    
    return Math.min(1.0, score);
  }

  private getFileTypeLabel(fileType: string): string {
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('word') || fileType.includes('doc')) return 'Word Document';
    if (fileType.includes('excel') || fileType.includes('csv')) return 'Spreadsheet';
    return 'Document';
  }
}

export const documentProcessingService = new DocumentProcessingService();

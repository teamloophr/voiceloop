import os
import io
import json
import uuid
import mimetypes
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
import PyPDF2
from docx import Document
import openai
from openai import OpenAI

class FileProcessingService:
    def __init__(self):
        self.client = OpenAI()
        self.supported_document_types = {
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'text/plain': 'txt',
            'text/markdown': 'md'
        }
        self.supported_audio_types = {
            'audio/wav': 'wav',
            'audio/mpeg': 'mp3',
            'audio/mp4': 'm4a',
            'audio/x-m4a': 'm4a',
            'audio/webm': 'webm'
        }
        self.max_file_size = 25 * 1024 * 1024  # 25MB limit
    
    def validate_file(self, file_data: bytes, filename: str, content_type: str) -> Tuple[bool, str]:
        """Validate uploaded file for security and format compliance"""
        
        # Check file size
        if len(file_data) > self.max_file_size:
            return False, f"File size exceeds maximum limit of {self.max_file_size // (1024*1024)}MB"
        
        # Check if file type is supported
        if content_type not in self.supported_document_types and content_type not in self.supported_audio_types:
            return False, f"Unsupported file type: {content_type}"
        
        # Basic security checks
        dangerous_extensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com']
        file_ext = os.path.splitext(filename.lower())[1]
        if file_ext in dangerous_extensions:
            return False, "Potentially dangerous file type detected"
        
        return True, "File validation passed"
    
    def extract_text_from_pdf(self, file_data: bytes) -> str:
        """Extract text content from PDF file"""
        try:
            pdf_file = io.BytesIO(file_data)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"
            
            return text_content.strip()
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_data: bytes) -> str:
        """Extract text content from DOCX file"""
        try:
            docx_file = io.BytesIO(file_data)
            doc = Document(docx_file)
            
            text_content = ""
            for paragraph in doc.paragraphs:
                text_content += paragraph.text + "\n"
            
            return text_content.strip()
        except Exception as e:
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")
    
    def extract_text_from_txt(self, file_data: bytes) -> str:
        """Extract text content from plain text file"""
        try:
            # Try UTF-8 first, then fallback to other encodings
            encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    return file_data.decode(encoding)
                except UnicodeDecodeError:
                    continue
            
            raise Exception("Unable to decode text file with supported encodings")
        except Exception as e:
            raise Exception(f"Failed to extract text from file: {str(e)}")
    
    def transcribe_audio(self, file_data: bytes, filename: str) -> str:
        """Transcribe audio file using OpenAI Whisper"""
        try:
            # Create a temporary file-like object
            audio_file = io.BytesIO(file_data)
            audio_file.name = filename  # Whisper needs a filename for format detection
            
            # Use OpenAI Whisper API for transcription
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
            
            return transcript
        except Exception as e:
            raise Exception(f"Failed to transcribe audio: {str(e)}")
    
    def extract_content(self, file_data: bytes, filename: str, content_type: str) -> str:
        """Extract text content from file based on its type"""
        
        if content_type in self.supported_document_types:
            file_format = self.supported_document_types[content_type]
            
            if file_format == 'pdf':
                return self.extract_text_from_pdf(file_data)
            elif file_format == 'docx':
                return self.extract_text_from_docx(file_data)
            elif file_format in ['txt', 'md']:
                return self.extract_text_from_txt(file_data)
        
        elif content_type in self.supported_audio_types:
            return self.transcribe_audio(file_data, filename)
        
        else:
            raise Exception(f"Unsupported content type: {content_type}")
    
    def analyze_content_with_ai(self, text_content: str, filename: str) -> Dict[str, Any]:
        """Analyze extracted text content using OpenAI GPT-4"""
        try:
            # Prepare the analysis prompt
            analysis_prompt = f"""
            Please analyze the following document content and provide a comprehensive analysis in JSON format:

            Document: {filename}
            Content: {text_content[:4000]}...  # Truncate for API limits

            Please provide the analysis in the following JSON structure:
            {{
                "summary": "A concise 2-3 sentence summary of the main content",
                "key_points": ["List of 3-5 key points or main ideas"],
                "category": "Document category (e.g., 'business', 'academic', 'personal', 'technical')",
                "tags": ["List of relevant tags or keywords"],
                "sentiment": "Overall sentiment (positive, negative, neutral)",
                "confidence_score": 0.95,
                "relevance_score": 0.85,
                "recommended_for_rag": true
            }}

            Ensure the response is valid JSON only, no additional text.
            """

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert document analyst. Provide detailed, accurate analysis in the requested JSON format."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse the JSON response
            analysis_text = response.choices[0].message.content.strip()
            
            # Clean up the response to ensure it's valid JSON
            if analysis_text.startswith('```json'):
                analysis_text = analysis_text[7:]
            if analysis_text.endswith('```'):
                analysis_text = analysis_text[:-3]
            
            analysis_result = json.loads(analysis_text)
            
            # Add computed statistics
            words = text_content.split()
            sentences = text_content.split('.')
            paragraphs = text_content.split('\n\n')
            
            analysis_result.update({
                'word_count': len(words),
                'sentence_count': len([s for s in sentences if s.strip()]),
                'paragraph_count': len([p for p in paragraphs if p.strip()]),
                'extracted_text': text_content
            })
            
            return analysis_result
            
        except json.JSONDecodeError as e:
            # Fallback analysis if JSON parsing fails
            return self._create_fallback_analysis(text_content, filename)
        except Exception as e:
            raise Exception(f"Failed to analyze content with AI: {str(e)}")
    
    def _create_fallback_analysis(self, text_content: str, filename: str) -> Dict[str, Any]:
        """Create a basic analysis when AI analysis fails"""
        words = text_content.split()
        sentences = text_content.split('.')
        paragraphs = text_content.split('\n\n')
        
        return {
            'summary': f"Document analysis for {filename}. Contains {len(words)} words across {len(paragraphs)} paragraphs.",
            'key_points': ["Content extracted successfully", "Ready for further processing"],
            'category': 'general',
            'tags': ['document', 'processed'],
            'sentiment': 'neutral',
            'confidence_score': 0.7,
            'relevance_score': 0.5,
            'recommended_for_rag': True,
            'word_count': len(words),
            'sentence_count': len([s for s in sentences if s.strip()]),
            'paragraph_count': len([p for p in paragraphs if p.strip()]),
            'extracted_text': text_content
        }
    
    def process_file(self, file_data: bytes, filename: str, content_type: str, user_id: str) -> Dict[str, Any]:
        """Complete file processing pipeline"""
        
        # Step 1: Validate file
        is_valid, validation_message = self.validate_file(file_data, filename, content_type)
        if not is_valid:
            raise Exception(validation_message)
        
        # Step 2: Extract content
        extracted_text = self.extract_content(file_data, filename, content_type)
        
        if not extracted_text.strip():
            raise Exception("No content could be extracted from the file")
        
        # Step 3: Analyze content with AI
        analysis_result = self.analyze_content_with_ai(extracted_text, filename)
        
        # Step 4: Prepare final result
        processing_result = {
            'file_info': {
                'filename': filename,
                'content_type': content_type,
                'file_size': len(file_data),
                'user_id': user_id
            },
            'analysis': analysis_result,
            'processing_timestamp': datetime.utcnow().isoformat(),
            'status': 'completed'
        }
        
        return processing_result
    
    def save_file_to_storage(self, file_data: bytes, filename: str, user_id: str) -> str:
        """Save uploaded file to storage and return the storage path"""
        
        # Create user-specific directory
        user_dir = os.path.join('uploads', user_id)
        os.makedirs(user_dir, exist_ok=True)
        
        # Generate unique filename to avoid conflicts
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(filename)[1]
        storage_filename = f"{file_id}{file_extension}"
        storage_path = os.path.join(user_dir, storage_filename)
        
        # Save file
        with open(storage_path, 'wb') as f:
            f.write(file_data)
        
        return storage_path

# Create a singleton instance
file_processor = FileProcessingService()


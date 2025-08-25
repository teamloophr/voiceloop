import os
import uuid
from typing import Dict, Any
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
import openai
import json

class FileProcessingService:
    def __init__(self):
        self.allowed_extensions = {'pdf', 'docx', 'txt', 'md', 'csv', 'wav', 'mp3', 'm4a', 'webm', 'ogg'}
        self.upload_folder = os.getenv('UPLOAD_FOLDER', 'uploads')
        
        # Create upload folder if it doesn't exist
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)
        
        # Initialize OpenAI client
        openai.api_key = os.getenv('OPENAI_API_KEY')
    
    def process_file(self, file, user_id: str) -> Dict[str, Any]:
        """Process uploaded file and extract content"""
        try:
            if not file or file.filename == '':
                return {'success': False, 'error': 'No file provided'}
            
            # Check file extension
            if not self._allowed_file(file.filename):
                return {'success': False, 'error': 'File type not allowed'}
            
            # Generate unique filename
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(self.upload_folder, unique_filename)
            
            # Save file
            file.save(file_path)
            file_size = os.path.getsize(file_path)
            
            # Extract content based on file type
            content = self._extract_content(file_path, file_extension)
            
            if content is None:
                return {'success': False, 'error': 'Could not extract content from file'}
            
            return {
                'success': True,
                'content': content,
                'file_path': file_path,
                'file_type': file_extension,
                'file_size': file_size,
                'filename': unique_filename
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def transcribe_audio(self, audio_file) -> Dict[str, Any]:
        """Transcribe audio file using OpenAI Whisper"""
        try:
            if not audio_file or audio_file.filename == '':
                return {'success': False, 'error': 'No audio file provided'}
            
            # Check if it's an audio file
            if not self._is_audio_file(audio_file.filename):
                return {'success': False, 'error': 'File is not an audio file'}
            
            # Save audio file temporarily
            filename = secure_filename(audio_file.filename)
            temp_path = os.path.join(self.upload_folder, f"temp_{uuid.uuid4()}_{filename}")
            audio_file.save(temp_path)
            
            try:
                # Transcribe using OpenAI Whisper
                if not openai.api_key:
                    return {'success': False, 'error': 'OpenAI API key not configured'}
                
                with open(temp_path, 'rb') as audio:
                    transcript = openai.Audio.transcribe(
                        "whisper-1",
                        audio,
                        response_format="text"
                    )
                
                # Clean up temp file
                os.remove(temp_path)
                
                return {
                    'success': True,
                    'transcription': transcript,
                    'language': 'en'  # Whisper auto-detects language
                }
                
            except Exception as e:
                # Clean up temp file on error
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                raise e
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def _is_audio_file(self, filename: str) -> bool:
        """Check if file is an audio file"""
        audio_extensions = {'wav', 'mp3', 'm4a', 'webm', 'ogg'}
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in audio_extensions
    
    def _extract_content(self, file_path: str, file_extension: str) -> str:
        """Extract text content from file based on type"""
        try:
            if file_extension == 'pdf':
                return self._extract_pdf_content(file_path)
            elif file_extension == 'docx':
                return self._extract_docx_content(file_path)
            elif file_extension in ['txt', 'md', 'csv']:
                return self._extract_text_content(file_path)
            else:
                return None
        except Exception as e:
            print(f"Error extracting content from {file_path}: {str(e)}")
            return None
    
    def _extract_pdf_content(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            print(f"Error reading PDF: {str(e)}")
            return None
    
    def _extract_docx_content(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error reading DOCX: {str(e)}")
            return None
    
    def _extract_text_content(self, file_path: str) -> str:
        """Extract text from plain text files"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            print(f"Error reading text file: {str(e)}")
            return None

    def generate_summary(self, content: str, filename: str) -> Dict[str, Any]:
        """Generate AI summary of document content using OpenAI"""
        try:
            if not openai.api_key:
                return {'success': False, 'error': 'OpenAI API key not configured'}
            
            max_chars = 8000
            if len(content) > max_chars:
                content = content[:max_chars] + "\n\n[Content truncated for summarization]"
            
            # Enhanced prompt for resume parsing
            prompt = f"""Please analyze the following document: {filename}

Document Content:
{content}

Please provide:

1. A 2-3 sentence executive summary
2. Key points and main topics covered
3. Document type and purpose
4. Any important data, figures, or conclusions

Additionally, if this appears to be a resume or job application, extract the following structured information in JSON format:
{{
  "full_name": "extracted full name",
  "position": "extracted job title/position",
  "department": "extracted department or field",
  "email": "extracted email address",
  "hire_date": "extracted hire date or availability date",
  "salary": "extracted salary expectation or current salary",
  "performance_score": "extracted performance metrics or ratings",
  "manager": "extracted manager name or supervisor",
  "pto_days": "extracted PTO information if available",
  "status": "Active" (default for new hires)
}}

If any field cannot be extracted, use null. Format your response as:
SUMMARY: [your summary here]
STRUCTURED_DATA: [JSON object here]"""

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert document analyst and HR specialist. Provide clear, concise summaries and extract structured data from resumes and documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Parse the response to extract summary and structured data
            summary = ""
            structured_data = {}
            
            if "SUMMARY:" in response_text and "STRUCTURED_DATA:" in response_text:
                parts = response_text.split("STRUCTURED_DATA:")
                summary_part = parts[0].replace("SUMMARY:", "").strip()
                structured_part = parts[1].strip()
                
                summary = summary_part
                
                try:
                    # Clean up the JSON part
                    structured_part = structured_part.strip()
                    if structured_part.startswith("```json"):
                        structured_part = structured_part[7:]
                    if structured_part.endswith("```"):
                        structured_part = structured_part[:-3]
                    
                    structured_data = json.loads(structured_part)
                except json.JSONDecodeError as e:
                    print(f"Warning: Could not parse structured data: {e}")
                    structured_data = {}
            else:
                # Fallback to treating entire response as summary
                summary = response_text
                structured_data = {}
            
            return {
                'success': True,
                'summary': summary,
                'structured_data': structured_data,
                'model_used': 'gpt-3.5-turbo',
                'tokens_used': response.usage.total_tokens
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to generate summary: {str(e)}'}

    def process_file_with_summary(self, file, user_id: str) -> Dict[str, Any]:
        """Process uploaded file, extract content, and generate AI summary"""
        try:
            # First process the file normally
            result = self.process_file(file, user_id)
            
            if not result['success']:
                return result
            
            # Generate AI summary if content was extracted
            if result.get('content'):
                summary_result = self.generate_summary(result['content'], result.get('filename', 'Unknown'))
                if summary_result['success']:
                    result['ai_summary'] = summary_result['summary']
                    result['summary_model'] = summary_result['model_used']
                    result['summary_tokens'] = summary_result['tokens_used']
                else:
                    result['summary_error'] = summary_result['error']
            
            return result
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

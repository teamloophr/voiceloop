import json
import re
from typing import Dict, Any, List
from datetime import datetime, timedelta
import openai
import os
import uuid

class MCPCalendarService:
    def __init__(self):
        # Initialize OpenAI client
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Common time expressions
        self.time_patterns = {
            'today': lambda: datetime.now(),
            'tomorrow': lambda: datetime.now() + timedelta(days=1),
            'next week': lambda: datetime.now() + timedelta(weeks=1),
            'next month': lambda: datetime.now() + timedelta(days=30),
            'in an hour': lambda: datetime.now() + timedelta(hours=1),
            'in 2 hours': lambda: datetime.now() + timedelta(hours=2),
            'this evening': lambda: datetime.now().replace(hour=18, minute=0, second=0, microsecond=0),
            'tonight': lambda: datetime.now().replace(hour=20, minute=0, second=0, microsecond=0),
        }
    
    def process_command(self, command: str, user_id: str) -> Dict[str, Any]:
        """Process natural language calendar command"""
        try:
            # Use AI to parse the command if available
            if openai.api_key:
                parsed_data = self._ai_parse_command(command)
            else:
                parsed_data = self._rule_based_parse_command(command)
            
            if not parsed_data:
                return {
                    'success': False,
                    'error': 'Could not parse calendar command'
                }
            
            # Execute the command
            result = self._execute_command(parsed_data, user_id)
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_event(self, event_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new calendar event"""
        try:
            # Validate required fields
            required_fields = ['title', 'start_time', 'end_time']
            for field in required_fields:
                if not event_data.get(field):
                    return {
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }
            
            # Parse times
            start_time = self._parse_time(event_data['start_time'])
            end_time = self._parse_time(event_data['end_time'])
            
            if not start_time or not end_time:
                return {
                    'success': False,
                    'error': 'Invalid time format'
                }
            
            # Create event object
            event = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'title': event_data['title'],
                'description': event_data.get('description', ''),
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'all_day': event_data.get('all_day', False),
                'location': event_data.get('location', ''),
                'event_type': event_data.get('event_type', 'meeting'),
                'priority': event_data.get('priority', 'medium'),
                'status': 'scheduled',
                'meta_data': json.dumps(event_data.get('meta_data', {})),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            return {
                'success': True,
                'event': event,
                'message': 'Event created successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _ai_parse_command(self, command: str) -> Dict[str, Any]:
        """Use AI to parse natural language calendar command"""
        try:
            prompt = f"""
            Parse this calendar command and return JSON with the following structure:
            {{
                "action": "create_event|find_event|update_event|delete_event",
                "title": "event title",
                "start_time": "time expression or specific time",
                "end_time": "time expression or specific time",
                "description": "event description if mentioned",
                "location": "location if mentioned",
                "attendees": ["email1", "email2"] if mentioned
            }}
            
            Command: "{command}"
            
            Return only valid JSON:
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a calendar command parser. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.1
            )
            
            parsed = json.loads(response.choices[0].message.content.strip())
            return parsed
            
        except Exception as e:
            print(f"AI parsing failed: {str(e)}")
            return None
    
    def _rule_based_parse_command(self, command: str) -> Dict[str, Any]:
        """Parse calendar command using rule-based approach"""
        command_lower = command.lower()
        
        # Detect action
        if any(word in command_lower for word in ['create', 'add', 'schedule', 'book']):
            action = 'create_event'
        elif any(word in command_lower for word in ['find', 'search', 'show', 'list']):
            action = 'find_event'
        elif any(word in command_lower for word in ['update', 'change', 'modify']):
            action = 'update_event'
        elif any(word in command_lower for word in ['delete', 'remove', 'cancel']):
            action = 'delete_event'
        else:
            action = 'create_event'  # Default action
        
        # Extract title (text between quotes or after action words)
        title_match = re.search(r'"([^"]+)"', command)
        if title_match:
            title = title_match.group(1)
        else:
            # Extract title after action words
            action_words = ['create', 'add', 'schedule', 'book', 'meeting', 'appointment']
            for word in action_words:
                if word in command_lower:
                    parts = command.split(word, 1)
                    if len(parts) > 1:
                        title = parts[1].strip().split()[0:3]  # Take first few words
                        title = ' '.join(title)
                        break
            else:
                title = 'Untitled Event'
        
        # Extract time information
        start_time = self._extract_time_from_text(command)
        end_time = start_time + timedelta(hours=1) if start_time else None
        
        return {
            'action': action,
            'title': title,
            'start_time': start_time.isoformat() if start_time else None,
            'end_time': end_time.isoformat() if end_time else None,
            'description': '',
            'location': '',
            'attendees': []
        }
    
    def _extract_time_from_text(self, text: str) -> datetime:
        """Extract time information from text"""
        text_lower = text.lower()
        
        # Check for specific time patterns
        for pattern, time_func in self.time_patterns.items():
            if pattern in text_lower:
                return time_func()
        
        # Check for specific time formats
        time_patterns = [
            r'(\d{1,2}):(\d{2})\s*(am|pm)?',  # 2:30 PM
            r'(\d{1,2})\s*(am|pm)',  # 2 PM
            r'(\d{1,2})',  # 2 (assume PM)
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, text_lower)
            if match:
                if ':' in pattern:
                    hour, minute = int(match.group(1)), int(match.group(2))
                    ampm = match.group(3) if match.group(3) else 'pm'
                else:
                    hour = int(match.group(1))
                    minute = 0
                    ampm = match.group(2) if match.group(2) else 'pm'
                
                # Convert to 24-hour format
                if ampm == 'pm' and hour != 12:
                    hour += 12
                elif ampm == 'am' and hour == 12:
                    hour = 0
                
                # Create datetime for today
                now = datetime.now()
                return now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        return None
    
    def _parse_time(self, time_str: str) -> datetime:
        """Parse time string to datetime object"""
        try:
            # Try ISO format first
            if 'T' in time_str or 'Z' in time_str:
                return datetime.fromisoformat(time_str.replace('Z', '+00:00'))
            
            # Try common formats
            formats = [
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d %H:%M',
                '%H:%M:%S',
                '%H:%M',
                '%I:%M %p',
                '%I %p'
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(time_str, fmt)
                except ValueError:
                    continue
            
            # If all else fails, try to extract from text
            return self._extract_time_from_text(time_str)
            
        except Exception as e:
            print(f"Error parsing time: {str(e)}")
            return None
    
    def _execute_command(self, parsed_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute the parsed calendar command"""
        action = parsed_data.get('action')
        
        if action == 'create_event':
            return self.create_event(parsed_data, user_id)
        elif action == 'find_event':
            return {
                'success': True,
                'message': 'Find event functionality not implemented yet',
                'action': 'find_event'
            }
        elif action == 'update_event':
            return {
                'success': True,
                'message': 'Update event functionality not implemented yet',
                'action': 'update_event'
            }
        elif action == 'delete_event':
            return {
                'success': True,
                'message': 'Delete event functionality not implemented yet',
                'action': 'delete_event'
            }
        else:
            return {
                'success': False,
                'error': f'Unknown action: {action}'
            }

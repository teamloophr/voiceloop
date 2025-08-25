import os
import json
import re
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import openai
from openai import OpenAI
from dateutil import parser
import pytz

class MCPCalendarService:
    def __init__(self):
        self.client = OpenAI()
        self.timezone = pytz.UTC  # Default to UTC, can be configured per user
        
    def process_natural_language(self, user_id: str, command: str) -> Dict[str, Any]:
        """Process natural language calendar commands using MCP principles"""
        try:
            # Parse the command using AI
            parsed_intent = self._parse_calendar_intent(command)
            
            # Execute the parsed command
            result = self._execute_calendar_command(user_id, parsed_intent)
            
            # Log the MCP command
            self._log_mcp_command(user_id, command, parsed_intent, result)
            
            return {
                'success': True,
                'intent': parsed_intent,
                'result': result,
                'command': command
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'command': command
            }
    
    def _parse_calendar_intent(self, command: str) -> Dict[str, Any]:
        """Parse natural language command into structured intent"""
        try:
            # AI-powered intent parsing
            prompt = f"""Parse this calendar command into structured intent:

Command: "{command}"

Extract:
1. Action (create, read, update, delete, find, schedule)
2. Event details (title, description, start_time, end_time, location, attendees)
3. Time expressions (today, tomorrow, next week, 3pm, etc.)
4. Priority level
5. Event type (meeting, reminder, task, event)

Format as JSON with keys: action, event_details, time_expressions, priority, event_type, confidence"""

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a calendar intent parser. Extract structured information from natural language commands."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.1
            )
            
            ai_response = response.choices[0].message.content
            
            # Try to parse AI response
            try:
                parsed = json.loads(ai_response)
                return parsed
            except:
                # Fallback to rule-based parsing
                return self._rule_based_parsing(command)
                
        except Exception as e:
            # Fallback to rule-based parsing
            return self._rule_based_parsing(command)
    
    def _rule_based_parsing(self, command: str) -> Dict[str, Any]:
        """Fallback rule-based parsing for calendar commands"""
        command_lower = command.lower()
        
        # Detect action
        action = 'read'
        if any(word in command_lower for word in ['create', 'add', 'schedule', 'book']):
            action = 'create'
        elif any(word in command_lower for word in ['update', 'change', 'modify']):
            action = 'update'
        elif any(word in command_lower for word in ['delete', 'remove', 'cancel']):
            action = 'delete'
        elif any(word in command_lower for word in ['find', 'search', 'show']):
            action = 'read'
        
        # Extract time expressions
        time_expressions = self._extract_time_expressions(command)
        
        # Extract event details
        event_details = self._extract_event_details(command)
        
        return {
            'action': action,
            'event_details': event_details,
            'time_expressions': time_expressions,
            'priority': 'medium',
            'event_type': 'meeting',
            'confidence': 0.7
        }
    
    def _extract_time_expressions(self, command: str) -> List[str]:
        """Extract time expressions from command"""
        time_patterns = [
            r'\b(today|tomorrow|yesterday)\b',
            r'\b(next|last)\s+(week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
            r'\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b',
            r'\b(\d{1,2})\s*(am|pm)\b',
            r'\b(in|at)\s+(\d{1,2})\s*(am|pm)\b',
            r'\b(\d{1,2})\s*(o\'?clock)\b',
            r'\b(morning|afternoon|evening|night)\b'
        ]
        
        time_expressions = []
        for pattern in time_patterns:
            matches = re.findall(pattern, command, re.IGNORECASE)
            time_expressions.extend(matches)
        
        return time_expressions
    
    def _extract_event_details(self, command: str) -> Dict[str, Any]:
        """Extract event details from command"""
        details = {}
        
        # Extract title (usually after "meeting with" or similar)
        title_match = re.search(r'(?:meeting|call|appointment)\s+with\s+([^,\.]+)', command, re.IGNORECASE)
        if title_match:
            details['title'] = title_match.group(1).strip()
        
        # Extract location
        location_match = re.search(r'(?:at|in|location)\s+([^,\.]+)', command, re.IGNORECASE)
        if location_match:
            details['location'] = location_match.group(1).strip()
        
        # Extract duration
        duration_match = re.search(r'(\d+)\s*(hour|hr|minute|min)s?', command, re.IGNORECASE)
        if duration_match:
            details['duration'] = {
                'value': int(duration_match.group(1)),
                'unit': duration_match.group(2)
            }
        
        return details
    
    def _execute_calendar_command(self, user_id: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the parsed calendar command"""
        action = intent.get('action', 'read')
        
        if action == 'create':
            return self._create_event(user_id, intent)
        elif action == 'read':
            return self._find_events(user_id, intent)
        elif action == 'update':
            return self._update_event(user_id, intent)
        elif action == 'delete':
            return self._delete_event(user_id, intent)
        else:
            return {'error': f'Unknown action: {action}'}
    
    def _create_event(self, user_id: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new calendar event"""
        try:
            # Parse time expressions
            start_time, end_time = self._parse_time_expressions(intent.get('time_expressions', []))
            
            # Build event data
            event_data = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'title': intent.get('event_details', {}).get('title', 'New Event'),
                'description': intent.get('event_details', {}).get('description', ''),
                'start_time': start_time,
                'end_time': end_time,
                'location': intent.get('event_details', {}).get('location', ''),
                'event_type': intent.get('event_type', 'meeting'),
                'priority': intent.get('priority', 'medium'),
                'status': 'scheduled',
                'source': 'voiceloop_mcp',
                'created_timestamp': datetime.utcnow().isoformat()
            }
            
            # Here you would save to database
            # For now, return the event data
            return {
                'action': 'created',
                'event': event_data,
                'message': f"Event '{event_data['title']}' scheduled for {start_time.strftime('%B %d, %Y at %I:%M %p')}"
            }
            
        except Exception as e:
            return {'error': f'Failed to create event: {str(e)}'}
    
    def _find_events(self, user_id: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Find calendar events based on criteria"""
        try:
            # Parse time expressions for date range
            start_time, end_time = self._parse_time_expressions(intent.get('time_expressions', []))
            
            # Build search criteria
            search_criteria = {
                'user_id': user_id,
                'start_time': start_time,
                'end_time': end_time
            }
            
            # Here you would query the database
            # For now, return mock results
            mock_events = [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Team Meeting',
                    'start_time': datetime.now().isoformat(),
                    'end_time': (datetime.now() + timedelta(hours=1)).isoformat(),
                    'location': 'Conference Room A'
                }
            ]
            
            return {
                'action': 'found',
                'events': mock_events,
                'count': len(mock_events),
                'search_criteria': search_criteria
            }
            
        except Exception as e:
            return {'error': f'Failed to find events: {str(e)}'}
    
    def _update_event(self, user_id: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing calendar event"""
        # Implementation for updating events
        return {'action': 'updated', 'message': 'Event update functionality not yet implemented'}
    
    def _delete_event(self, user_id: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Delete a calendar event"""
        # Implementation for deleting events
        return {'action': 'deleted', 'message': 'Event deletion functionality not yet implemented'}
    
    def _parse_time_expressions(self, time_expressions: List[str]) -> Tuple[datetime, datetime]:
        """Parse time expressions into actual datetime objects"""
        now = datetime.now(self.timezone)
        
        # Default to today
        start_time = now.replace(hour=9, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(hours=1)
        
        for expr in time_expressions:
            expr_lower = str(expr).lower()
            
            if 'tomorrow' in expr_lower:
                start_time = (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
                end_time = start_time + timedelta(hours=1)
            elif 'next week' in expr_lower:
                start_time = (now + timedelta(weeks=1)).replace(hour=9, minute=0, second=0, microsecond=0)
                end_time = start_time + timedelta(hours=1)
            elif 'next monday' in expr_lower:
                days_ahead = 7 - now.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                start_time = (now + timedelta(days=days_ahead)).replace(hour=9, minute=0, second=0, microsecond=0)
                end_time = start_time + timedelta(hours=1)
            elif 'morning' in expr_lower:
                start_time = start_time.replace(hour=9, minute=0)
                end_time = start_time + timedelta(hours=1)
            elif 'afternoon' in expr_lower:
                start_time = start_time.replace(hour=14, minute=0)
                end_time = start_time + timedelta(hours=1)
            elif 'evening' in expr_lower:
                start_time = start_time.replace(hour=18, minute=0)
                end_time = start_time + timedelta(hours=1)
        
        return start_time, end_time
    
    def get_events(self, user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get calendar events for a user within a date range"""
        try:
            # Parse date parameters
            start_dt = None
            end_dt = None
            
            if start_date:
                start_dt = parser.parse(start_date)
            if end_date:
                end_dt = parser.parse(end_date)
            
            # Here you would query the database
            # For now, return mock events
            mock_events = [
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Daily Standup',
                    'start_time': datetime.now().isoformat(),
                    'end_time': (datetime.now() + timedelta(minutes=30)).isoformat(),
                    'location': 'Zoom',
                    'event_type': 'meeting'
                },
                {
                    'id': str(uuid.uuid4()),
                    'title': 'Project Review',
                    'start_time': (datetime.now() + timedelta(days=1)).isoformat(),
                    'end_time': (datetime.now() + timedelta(days=1, hours=2)).isoformat(),
                    'location': 'Conference Room B',
                    'event_type': 'meeting'
                }
            ]
            
            return mock_events
            
        except Exception as e:
            print(f"Failed to get events: {e}")
            return []
    
    def create_event(self, user_id: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a calendar event with structured data"""
        try:
            # Validate required fields
            required_fields = ['title', 'start_time', 'end_time']
            for field in required_fields:
                if field not in event_data:
                    return {'error': f'Missing required field: {field}'}
            
            # Parse datetime strings
            try:
                start_time = parser.parse(event_data['start_time'])
                end_time = parser.parse(event_data['end_time'])
            except Exception as e:
                return {'error': f'Invalid datetime format: {str(e)}'}
            
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
                'source': 'voiceloop',
                'created_timestamp': datetime.utcnow().isoformat()
            }
            
            # Here you would save to database
            # For now, return the event
            return {
                'success': True,
                'event': event,
                'message': f"Event '{event['title']}' created successfully"
            }
            
        except Exception as e:
            return {'error': f'Failed to create event: {str(e)}'}
    
    def _log_mcp_command(self, user_id: str, command: str, intent: Dict[str, Any], result: Dict[str, Any]) -> None:
        """Log MCP command execution for analytics"""
        try:
            # Here you would save to database
            # For now, just print for debugging
            print(f"MCP Command Log:")
            print(f"  User: {user_id}")
            print(f"  Command: {command}")
            print(f"  Intent: {json.dumps(intent, indent=2)}")
            print(f"  Result: {json.dumps(result, indent=2)}")
            print(f"  Timestamp: {datetime.utcnow().isoformat()}")
        except Exception as e:
            print(f"Failed to log MCP command: {e}")
    
    def get_calendar_summary(self, user_id: str, date_range: str = 'week') -> Dict[str, Any]:
        """Get a summary of calendar events for a date range"""
        try:
            now = datetime.now(self.timezone)
            
            if date_range == 'today':
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)
            elif date_range == 'week':
                start_date = now - timedelta(days=now.weekday())
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=7)
            elif date_range == 'month':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                if now.month == 12:
                    end_date = now.replace(year=now.year + 1, month=1, day=1)
                else:
                    end_date = now.replace(month=now.month + 1, day=1)
            else:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)
            
            # Get events for the range
            events = self.get_events(user_id, start_date.isoformat(), end_date.isoformat())
            
            # Generate summary
            summary = {
                'date_range': date_range,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'total_events': len(events),
                'meetings': len([e for e in events if e.get('event_type') == 'meeting']),
                'reminders': len([e for e in events if e.get('event_type') == 'reminder']),
                'tasks': len([e for e in events if e.get('event_type') == 'task']),
                'upcoming_events': events[:5],  # Next 5 events
                'busiest_day': self._find_busiest_day(events),
                'free_time_slots': self._find_free_time_slots(events, start_date, end_date)
            }
            
            return summary
            
        except Exception as e:
            return {'error': f'Failed to generate calendar summary: {str(e)}'}
    
    def _find_busiest_day(self, events: List[Dict[str, Any]]) -> Optional[str]:
        """Find the busiest day in the event list"""
        if not events:
            return None
        
        day_counts = {}
        for event in events:
            try:
                start_time = parser.parse(event['start_time'])
                day_key = start_time.strftime('%Y-%m-%d')
                day_counts[day_key] = day_counts.get(day_key, 0) + 1
            except:
                continue
        
        if day_counts:
            busiest_day = max(day_counts, key=day_counts.get)
            return busiest_day
        
        return None
    
    def _find_free_time_slots(self, events: List[Dict[str, Any]], start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Find free time slots in the calendar"""
        # This is a simplified implementation
        # In production, you'd want more sophisticated time slot analysis
        
        free_slots = []
        current_time = start_date
        
        while current_time < end_date:
            # Check if there's an event at this time
            has_event = any(
                self._time_overlaps(current_time, event)
                for event in events
            )
            
            if not has_event:
                # Found a free slot
                slot_end = min(current_time + timedelta(hours=1), end_date)
                free_slots.append({
                    'start_time': current_time.isoformat(),
                    'end_time': slot_end.isoformat(),
                    'duration_minutes': int((slot_end - current_time).total_seconds() / 60)
                })
            
            current_time += timedelta(hours=1)
        
        return free_slots
    
    def _time_overlaps(self, time: datetime, event: Dict[str, Any]) -> bool:
        """Check if a time overlaps with an event"""
        try:
            event_start = parser.parse(event['start_time'])
            event_end = parser.parse(event['end_time'])
            
            return event_start <= time < event_end
        except:
            return False

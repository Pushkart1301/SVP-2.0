import os
import json
from groq import Groq
from app.core.config import settings

class AIEngine:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
        else:
            print("Groq API Key missing. AI features will fail.")

    def _get_json_response(self, prompt: str, model="llama-3.3-70b-versatile"):
        if not self.client:
            return None
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that outputs ONLY valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=model,
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"AI Engine Error: {e}")
            return None

    def extract_calendar_events(self, ocr_text: str):
        prompt = f"""
        Extract academic holidays and exam dates from the following text:
        ---
        {ocr_text}
        ---
        Return JSON format:
        {{
            "holidays": [ {{"name": "Event Name", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}} ],
            "exams": [ {{"subject": "Subject Name", "date": "YYYY-MM-DD"}} ]
        }}
        """
        return self._get_json_response(prompt)

    def generate_vacation_plan(self, attendance_summary, schedule, holidays, target_pct=75, query=None):
        base_prompt = f"""
        Analyze the student's attendance and propose safe vacation windows.
        Current Attendance: {json.dumps(attendance_summary)}
        Weekly Schedule (Subjects per day): {json.dumps(schedule)}
        Academic Holidays: {json.dumps(holidays)}
        Minimum Attendance Target: {target_pct}%
        """
        
        if query:
            base_prompt += f"""
            USER QUERY: "{query}"
            
            Task: Answer the user's specific question about vacation/leave. 
            Check if the requested leave is possible without dropping attendance below {target_pct}%.
            If specific dates/month mentioned, check those. 
            """
        else:
            base_prompt += f"""
            Task: Propose 3 optimal, safe vacation windows (3-7 days) that minimize impact on attendance.
            Top priority: Don't drop any subject below {target_pct}%.
            """
            
        base_prompt += """
        Return JSON:
        {
            "windows": [
                {
                    "start_date": "YYYY-MM-DD", 
                    "end_date": "YYYY-MM-DD", 
                    "reason": "Detailed explanation...",
                    "projected_attendance": { "SubjectA": 76.5, ... } 
                }
            ],
            "ai_advice": "General advice or direct answer to the user's query"
        }
        """
        return self._get_json_response(base_prompt)

    def generate_study_plan(self, subjects, preferences):
        prompt = f"""
        Create a 7-day study plan.
        Subjects & Status: {json.dumps(subjects)}
        Preferences: {json.dumps(preferences)}
        
        Return JSON:
        {{
            "summary": "Focus heavily on Math this week...",
            "daily_tasks": [
                {{
                    "date": "YYYY-MM-DD",
                    "tasks": [ {{"subject": "Math", "topic": "Calculus", "duration_mins": 60}} ]
                }}
            ]
        }}
        """
        return self._get_json_response(prompt)

ai_engine = AIEngine()

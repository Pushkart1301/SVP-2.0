
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from enum import Enum
import json


class DayType(Enum):
    WEEKDAY = "weekday"
    WEEKEND = "weekend"
    HOLIDAY = "holiday"


@dataclass
class Subject:
    """Represents a subject with attendance tracking"""
    subject_id: str
    name: str
    attended: int
    total: int
    threshold: float  # Minimum required percentage (e.g., 75.0)
    
    @property
    def current_percentage(self) -> float:
        """Calculate current attendance percentage"""
        if self.total == 0:
            return 100.0
        return (self.attended / self.total) * 100
    
    @property
    def buffer(self) -> float:
        """How much buffer above threshold (can be negative)"""
        return self.current_percentage - self.threshold
    
    def simulate_absence(self, missed_lectures: int) -> float:
        """Project attendance if student misses lectures"""
        new_total = self.total + missed_lectures
        if new_total == 0:
            return 100.0
        return (self.attended / new_total) * 100


@dataclass
class VacationWindow:
    """Represents a potential vacation period"""
    start_date: datetime
    end_date: datetime
    days: List[Tuple[datetime, DayType]]
    subject_impacts: Dict[str, Dict]  # subject_id -> impact data
    is_safe: bool
    score: float = 0.0
    
    @property
    def total_days(self) -> int:
        return len(self.days)
    
    @property
    def leave_days(self) -> int:
        """Count only weekdays (actual leave days)"""
        return sum(1 for _, day_type in self.days if day_type == DayType.WEEKDAY)
    
    @property
    def holiday_count(self) -> int:
        return sum(1 for _, day_type in self.days if day_type in [DayType.WEEKEND, DayType.HOLIDAY])


class VacationRecommendationEngine:
    """
    Core simulation engine for vacation planning
    Uses deterministic logic - NO AI guessing
    """
    
    def __init__(
        self,
        subjects: List[Subject],
        weekly_schedule: Dict[str, List[str]],  # day_name -> [subject_ids]
        academic_calendar: Dict[str, DayType],  # date_str -> DayType
        global_threshold: float = 75.0
    ):
        """
        Args:
            subjects: List of Subject objects with attendance data
            weekly_schedule: {"Monday": ["CS101", "MATH201"], ...}
            academic_calendar: {"2024-03-15": DayType.HOLIDAY, ...}
            global_threshold: Default minimum attendance percentage
        """
        self.subjects = {s.subject_id: s for s in subjects}
        self.weekly_schedule = weekly_schedule
        self.academic_calendar = academic_calendar
        self.global_threshold = global_threshold
    
    def get_day_type(self, date: datetime) -> DayType:
        """Determine if a date is weekday/weekend/holiday"""
        date_str = date.strftime("%Y-%m-%d")
        
        # Check academic calendar first
        if date_str in self.academic_calendar:
            return self.academic_calendar[date_str]
        
        # Check if weekend (Saturday=5, Sunday=6)
        if date.weekday() in [5, 6]:
            return DayType.WEEKEND
        
        return DayType.WEEKDAY
    
    def get_subjects_on_day(self, date: datetime) -> List[str]:
        """Get list of subject IDs scheduled on this day"""
        day_name = date.strftime("%A")
        return self.weekly_schedule.get(day_name, [])
    
    def generate_vacation_windows(
        self,
        start_date: datetime,
        search_days: int = 60,
        min_window: int = 2,
        max_window: int = 7
    ) -> List[VacationWindow]:
        """
        Generate all possible vacation windows within date range
        
        Args:
            start_date: Start searching from this date
            search_days: Look ahead this many days
            min_window: Minimum vacation length
            max_window: Maximum vacation length
        """
        windows = []
        
        for window_size in range(min_window, max_window + 1):
            for day_offset in range(search_days - window_size + 1):
                window_start = start_date + timedelta(days=day_offset)
                window_end = window_start + timedelta(days=window_size - 1)
                
                # Build day-by-day breakdown
                days = []
                current = window_start
                while current <= window_end:
                    day_type = self.get_day_type(current)
                    days.append((current, day_type))
                    current += timedelta(days=1)
                
                # Skip windows that are 100% holidays/weekends (no actual leave needed)
                if all(dt != DayType.WEEKDAY for _, dt in days):
                    continue
                
                windows.append(VacationWindow(
                    start_date=window_start,
                    end_date=window_end,
                    days=days,
                    subject_impacts={},
                    is_safe=False
                ))
        
        return windows
    
    def simulate_vacation_impact(self, window: VacationWindow) -> VacationWindow:
        """
        CORE LOGIC: Simulate attendance impact for a vacation window
        This is deterministic calculation - no AI involved
        """
        subject_impacts = {}
        all_subjects_safe = True
        
        for subject_id, subject in self.subjects.items():
            # Count how many lectures this subject has during vacation
            missed_lectures = 0
            for date, day_type in window.days:
                if day_type == DayType.WEEKDAY:  # Only count actual class days
                    subjects_today = self.get_subjects_on_day(date)
                    if subject_id in subjects_today:
                        missed_lectures += 1
            
            # Calculate projected attendance
            projected_percentage = subject.simulate_absence(missed_lectures)
            threshold = subject.threshold if subject.threshold > 0 else self.global_threshold
            is_safe = projected_percentage >= threshold
            
            subject_impacts[subject_id] = {
                "subject_name": subject.name,
                "current_attendance": subject.current_percentage,
                "current_buffer": subject.buffer,
                "missed_lectures": missed_lectures,
                "projected_attendance": projected_percentage,
                "projected_buffer": projected_percentage - threshold,
                "threshold": threshold,
                "is_safe": is_safe
            }
            
            if not is_safe:
                all_subjects_safe = False
        
        window.subject_impacts = subject_impacts
        window.is_safe = all_subjects_safe
        
        return window
    
    def rank_vacation_windows(self, windows: List[VacationWindow]) -> List[VacationWindow]:
        """
        Rank safe vacation windows based on multiple factors
        Higher score = better vacation option
        """
        for window in windows:
            if not window.is_safe:
                window.score = -1000  # Mark unsafe windows
                continue
            
            # Calculate minimum buffer across all subjects after vacation
            min_buffer = min(
                impact["projected_buffer"] 
                for impact in window.subject_impacts.values()
            )
            
            # Calculate total attendance drop
            total_drop = sum(
                impact["current_attendance"] - impact["projected_attendance"]
                for impact in window.subject_impacts.values()
            )
            
            # Scoring formula (tuned for student priorities)
            score = (
                window.leave_days * 10  # More consecutive leave = better
                + window.holiday_count * 5  # More holidays in window = better
                - total_drop * 2  # Less attendance drop = better
                + min_buffer * 3  # More safety buffer = better
            )
            
            window.score = score
        
        # Sort by score (highest first)
        return sorted(windows, key=lambda w: w.score, reverse=True)
    
    def find_safe_vacations(
        self,
        start_date: Optional[datetime] = None,
        top_n: int = 3
    ) -> List[VacationWindow]:
        """
        Main entry point: Find and rank safe vacation windows
        
        Returns:
            List of top N safe vacation windows with simulation results
        """
        if start_date is None:
            start_date = datetime.now()
        
        # Step 1: Generate all possible windows
        all_windows = self.generate_vacation_windows(start_date)
        
        # Step 2: Simulate impact for each window
        simulated_windows = [
            self.simulate_vacation_impact(window) 
            for window in all_windows
        ]
        
        # Step 3: Filter only safe windows
        safe_windows = [w for w in simulated_windows if w.is_safe]
        
        # Step 4: Rank safe windows
        ranked_windows = self.rank_vacation_windows(safe_windows)
        
        # Return top N
        return ranked_windows[:top_n]


class AIReasoningLayer:
    """
    AI/LLM layer for generating explanations and advice
    This uses the simulation results (truth) to provide reasoning
    """
    
    @staticmethod
    def generate_ai_prompt(
        vacation_windows: List[VacationWindow],
        subjects: Dict[str, Subject]
    ) -> str:
        """
        Create prompt for LLM to explain vacation recommendations
        The prompt contains ALL simulation data (the truth)
        """
        
        # Prepare subject summary
        subject_summary = []
        for subject_id, subject in subjects.items():
            subject_summary.append(
                f"- {subject.name}: {subject.current_percentage:.1f}% "
                f"(Threshold: {subject.threshold:.0f}%, Buffer: {subject.buffer:+.1f}%)"
            )
        
        # Prepare vacation window details
        window_details = []
        for idx, window in enumerate(vacation_windows, 1):
            days_str = f"{window.start_date.strftime('%b %d')} to {window.end_date.strftime('%b %d')}"
            leave_days = window.leave_days
            holidays = window.holiday_count
            
            impacts = []
            for subject_id, impact in window.subject_impacts.items():
                impacts.append(
                    f"  - {impact['subject_name']}: "
                    f"{impact['current_attendance']:.1f}% → {impact['projected_attendance']:.1f}% "
                    f"(missed {impact['missed_lectures']} lectures, buffer: {impact['projected_buffer']:+.1f}%)"
                )
            
            window_details.append(
                f"Option {idx}: {days_str}\n"
                f"  • {leave_days} leave days, {holidays} holidays/weekends\n"
                f"  • Score: {window.score:.1f}\n"
                f"  • Subject Impact:\n" + "\n".join(impacts)
            )
        
        prompt = f"""You are an academic advisor AI helping a college student plan their vacation safely.

CURRENT ATTENDANCE STATUS:
{chr(10).join(subject_summary)}

SAFE VACATION OPTIONS FOUND:
{chr(10).join(window_details)}

Your task:
1. Explain WHY each vacation option is safe in simple, friendly language
2. Recommend the BEST option and explain your reasoning
3. Warn about any subjects that are close to the threshold (buffer < 3%)
4. Give practical advice like "attend extra classes before vacation" if needed

Write your response as if you're talking to a busy college student. Be concise, helpful, and encouraging.
Do NOT make up any numbers - use only the data provided above.
"""
        return prompt
    
    @staticmethod
    def format_results_for_student(
        vacation_windows: List[VacationWindow],
        ai_explanation: str
    ) -> Dict:
        """
        Format final output for the frontend/API
        """
        results = {
            "success": len(vacation_windows) > 0,
            "vacation_options": [],
            "ai_advice": ai_explanation
        }
        
        for idx, window in enumerate(vacation_windows, 1):
            option = {
                "rank": idx,
                "start_date": window.start_date.strftime("%Y-%m-%d"),
                "end_date": window.end_date.strftime("%Y-%m-%d"),
                "total_days": window.total_days,
                "leave_days": window.leave_days,
                "holidays": window.holiday_count,
                "score": round(window.score, 2),
                "day_breakdown": [
                    {
                        "date": date.strftime("%Y-%m-%d"),
                        "day_name": date.strftime("%A"),
                        "type": day_type.value
                    }
                    for date, day_type in window.days
                ],
                "subject_projections": window.subject_impacts
            }
            results["vacation_options"].append(option)
        
        return results
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, date

# --- Subject Models ---
class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1)
    code: str
    color_hex: str = "#3B82F6" # Default blue
    target_attendance_percent: float = 75.0

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: str = Field(alias="_id")
    user_id: str
    
    model_config = ConfigDict(populate_by_name=True)

# --- Schedule Models ---
class ScheduleSlot(BaseModel):
    start_time: str # "HH:MM"
    end_time: str # "HH:MM"
    subject_id: str
    room: Optional[str] = None

class WeekdaySchedule(BaseModel):
    weekday: int = Field(..., ge=0, le=6) # 0=Monday, 6=Sunday
    slots: List[ScheduleSlot] = []

class ScheduleResponse(WeekdaySchedule):
    id: str = Field(alias="_id")
    user_id: str
    
    model_config = ConfigDict(populate_by_name=True)

# --- Attendance Models ---
class AttendanceEntry(BaseModel):
    subject_id: str
    status: str # "P", "A", "C" (Cancelled)

class DailyAttendance(BaseModel):
    date: date
    entries: List[AttendanceEntry]

class DailyAttendanceResponse(DailyAttendance):
    id: str = Field(alias="_id")
    user_id: str
    
    model_config = ConfigDict(populate_by_name=True)

class AttendanceStats(BaseModel):
    subject_id: str
    total_classes: int
    attended_classes: int
    current_percentage: float
    bunk_rate: float

class OverallAttendanceStats(BaseModel):
    total_lectures: int
    lectures_attended: int
    lectures_missed: int
    overall_percentage: float


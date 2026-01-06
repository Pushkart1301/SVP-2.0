from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class SubjectBase(BaseModel):
    name: str
    code: str
    target_attendance_percent: int = 75

class SubjectCreate(SubjectBase):
    pass

class SubjectInDB(SubjectBase):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True)

class SubjectResponse(SubjectBase):
    id: str = Field(alias="_id")
    
    model_config = ConfigDict(populate_by_name=True)

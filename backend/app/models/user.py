from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

# Domain Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    profile_image: Optional[str] = None

class UserInDB(UserBase):
    id: Optional[str] = Field(default=None, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True)

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime
    
    model_config = ConfigDict(populate_by_name=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

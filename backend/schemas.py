from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Auth schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Prompt schemas
class PromptCreate(BaseModel):
    title: str
    content: str
    tags: Optional[str] = ""

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None

class PromptOut(BaseModel):
    id: int
    title: str
    content: str
    tags: str
    user_id: int
    owner: UserOut
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
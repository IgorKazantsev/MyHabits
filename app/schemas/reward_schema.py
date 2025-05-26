from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RewardBase(BaseModel):
    title: str
    description: Optional[str] = None
    required_days: int

class RewardCreate(RewardBase):
    pass

class RewardUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    required_days: Optional[int]

class RewardResponse(RewardBase):
    reward_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # для pydantic v2

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HabitLogCreate(BaseModel):
    habit_id: int
    date: datetime
    status: str
    points_earned: int

class HabitLogUpdate(BaseModel):
    status: Optional[str] = None
    points_earned: Optional[int] = None

class HabitLogResponse(BaseModel):
    habit_log_id: int
    habit_id: int
    date: datetime
    status: str
    points_earned: int

    class Config:
        from_attributes = True  # для Pydantic v2

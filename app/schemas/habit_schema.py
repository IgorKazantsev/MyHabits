from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.reward_schema import RewardCreate, RewardResponse

class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    schedule_type: str
    days_of_week: Optional[List[str]] = None  # 🔥 Новое поле: список дней недели
    reward: Optional[RewardCreate] = None  # Объект награды

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    schedule_type: Optional[str] = None
    days_of_week: Optional[List[str]] = None  # 🔥 Новое поле
    reward: Optional[RewardCreate] = None  # Объект награды для замены

class HabitResponse(BaseModel):
    habit_id: int
    name: str
    description: Optional[str]
    schedule_type: str
    days_of_week: Optional[List[str]] = None  # 🔥 Новое поле
    created_at: datetime
    reward: Optional[RewardResponse] = None  # Вложенный объект

    class Config:
        from_attributes = True

from sqlalchemy import Column, Integer, Unicode, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Habit(Base):
    __tablename__ = "Habits"

    habit_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"))
    name = Column(Unicode(100), nullable=False)
    description = Column(Unicode(255))
    schedule_type = Column(Unicode(20), nullable=False)
    days_of_week = Column(JSON, nullable=True)  # 🔥 Новое поле для хранения дней недели
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связь с наградой
    reward_id = Column(Integer, ForeignKey("Rewards.reward_id"), nullable=True)
    reward = relationship("Reward", back_populates="habits")

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


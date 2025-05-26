from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class HabitLog(Base):
    __tablename__ = "Habit_logs"

    habit_log_id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("Habits.habit_id"))
    date = Column(DateTime)
    status = Column(String(20))  # 'done', 'skipped', 'rest'
    points_earned = Column(Integer)

    habit = relationship("Habit", back_populates="logs")

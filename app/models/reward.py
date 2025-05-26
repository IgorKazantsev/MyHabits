from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Reward(Base):
    __tablename__ = "Rewards"

    reward_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"))
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    required_days = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔹 Связь с пользователем
    user = relationship("User", back_populates="rewards")

    # 🔹 Обратная связь с привычками
    habits = relationship("Habit", back_populates="reward")

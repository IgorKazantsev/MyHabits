from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1)
    role = Column(String(20), default="user")  
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    habits = relationship("Habit", back_populates="user")
    rewards = relationship("Reward", back_populates="user")
    user_levels = relationship("UserLevel", back_populates="user")  # 🟢 Добавлено

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class UserLevel(Base):
    __tablename__ = "User_levels"

    user_id = Column(Integer, ForeignKey("Users.user_id"), primary_key=True)
    level_id = Column(Integer, ForeignKey("Levels.level_id"), primary_key=True)
    achieved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="user_levels")
    level = relationship("Level")

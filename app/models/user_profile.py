from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserProfile(Base):
    __tablename__ = "User_profiles"

    user_id = Column(Integer, ForeignKey("Users.user_id"), primary_key=True)
    full_name = Column(String(100))
    total_points = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    last_activity_at = Column(DateTime)

    user = relationship("User", back_populates="profile")

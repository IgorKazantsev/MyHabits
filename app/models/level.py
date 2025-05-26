from sqlalchemy import Column, Integer, String
from app.database import Base

class Level(Base):
    __tablename__ = "Levels"

    level_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    required_points = Column(Integer)

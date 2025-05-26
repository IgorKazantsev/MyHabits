from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.auth.dependencies import get_current_user
from datetime import date
from sqlalchemy import func
from fastapi.responses import JSONResponse


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Функция для подключения к базе
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Общая статистика
@router.get("/summary")
def get_admin_summary(db: Session = Depends(get_db)):
    try:
        users = db.query(User).count()
        habits = db.query(Habit).count()
        logs = db.query(HabitLog).count()
        done_logs = db.query(HabitLog).filter(HabitLog.status == "done").count()
        skipped_logs = db.query(HabitLog).filter(HabitLog.status == "skipped").count()

        return {
            "total_users": users,
            "total_habits": habits,
            "total_logs": logs,
            "done_logs": done_logs,
            "skipped_logs": skipped_logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Все привычки всех пользователей
@router.get("/habits")
def get_all_habits(db: Session = Depends(get_db)):
    try:
        habits = db.query(Habit).all()
        return [
            {
                "habit_id": h.habit_id,
                "user_id": h.user_id,
                "name": h.name,
                "description": h.description,
                "schedule_type": h.schedule_type,
                "created_at": h.created_at
            }
            for h in habits
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Все логи активности
@router.get("/logs")
def get_all_logs(db: Session = Depends(get_db)):
    try:
        logs = db.query(HabitLog).all()
        return [
            {
                "log_id": l.habit_log_id,
                "habit_id": l.habit_id,
                "date": l.date,
                "status": l.status,
                "points_earned": l.points_earned
            }
            for l in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/activity-chart")
def get_activity_chart(db: Session = Depends(get_db)):
    logs_by_date = (
        db.query(HabitLog.date, func.count().label("count"))
        .filter(HabitLog.status == "done")
        .group_by(HabitLog.date)
        .order_by(HabitLog.date)
        .all()
    )
    result = [{"date": log.date.strftime("%Y-%m-%d"), "count": log.count} for log in logs_by_date]
    return JSONResponse(content=result)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.habit import Habit
from app.models.reward import Reward
from app.schemas.habit_schema import HabitCreate, HabitUpdate, HabitResponse
from app.schemas.reward_schema import RewardCreate
from app.auth.dependencies import get_current_user
from app.models.user import User
from datetime import datetime
import json

router = APIRouter(prefix="/habits", tags=["Habits"])


@router.get("/", response_model=list[HabitResponse])
def get_user_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habits = db.query(Habit).filter(Habit.user_id == current_user.user_id).all()

    # Десериализация days_of_week перед отправкой
    for habit in habits:
        if habit.days_of_week:
            habit.days_of_week = json.loads(habit.days_of_week)
    
    return habits


@router.post("/", response_model=HabitResponse)
def create_habit(
    habit: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reward_instance = None
    if habit.reward:
        reward_instance = Reward(
            title=habit.reward.title,
            description=habit.reward.description,
            required_days=habit.reward.required_days,
            user_id=current_user.user_id,
            created_at=datetime.utcnow()
        )
        db.add(reward_instance)
        db.flush()

    new_habit = Habit(
        name=habit.name,
        description=habit.description,
        schedule_type=habit.schedule_type,
        days_of_week=json.dumps(habit.days_of_week) if habit.days_of_week else None,  # сериализация
        user_id=current_user.user_id,
        reward_id=reward_instance.reward_id if reward_instance else None
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)

    # Десериализация перед ответом
    if new_habit.days_of_week:
        new_habit.days_of_week = json.loads(new_habit.days_of_week)

    return new_habit


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,
    habit_update: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(
        Habit.habit_id == habit_id,
        Habit.user_id == current_user.user_id
    ).first()

    if not habit:
        raise HTTPException(status_code=404, detail="Привычка не найдена")

    update_data = habit_update.dict(exclude_unset=True)

    if "reward" in update_data and update_data["reward"] is not None:
        if habit.reward:
            habit.reward.title = update_data["reward"]["title"]
            habit.reward.description = update_data["reward"].get("description")
            habit.reward.required_days = update_data["reward"]["required_days"]
        else:
            new_reward = Reward(
                title=update_data["reward"]["title"],
                description=update_data["reward"].get("description"),
                required_days=update_data["reward"]["required_days"],
                user_id=current_user.user_id,
                created_at=datetime.utcnow()
            )
            db.add(new_reward)
            db.flush()
            habit.reward_id = new_reward.reward_id

    for field in ["name", "description", "schedule_type", "days_of_week"]:
        if field in update_data:
            if field == "days_of_week" and update_data[field] is not None:
                setattr(habit, field, json.dumps(update_data[field]))  # сериализация
            else:
                setattr(habit, field, update_data[field])

    db.commit()
    db.refresh(habit)

    # Десериализация перед ответом
    if habit.days_of_week:
        habit.days_of_week = json.loads(habit.days_of_week)

    return habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(
        Habit.habit_id == habit_id,
        Habit.user_id == current_user.user_id
    ).first()

    if not habit:
        raise HTTPException(status_code=404, detail="Привычка не найдена")

    db.delete(habit)
    db.commit()
    return None

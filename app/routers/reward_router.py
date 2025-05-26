from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reward import Reward
from app.schemas.reward_schema import RewardCreate, RewardUpdate, RewardResponse
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/rewards",
    tags=["Rewards"]
)

# 🔹 Получить все награды пользователя
@router.get("/", response_model=list[RewardResponse])
def get_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Reward).filter(Reward.user_id == current_user.user_id).all()

# 🔹 Создать награду
@router.post("/", response_model=RewardResponse)
def create_reward(
    reward: RewardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_reward = Reward(
        **reward.dict(),
        user_id=current_user.user_id
    )
    db.add(new_reward)
    db.commit()
    db.refresh(new_reward)
    return new_reward

# 🔹 Обновить награду
@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(
    reward_id: int,
    reward_update: RewardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reward = db.query(Reward).filter(
        Reward.reward_id == reward_id,
        Reward.user_id == current_user.user_id
    ).first()

    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    for key, value in reward_update.dict(exclude_unset=True).items():
        setattr(reward, key, value)

    db.commit()
    db.refresh(reward)
    return reward

# 🔹 Удалить награду
@router.delete("/{reward_id}", status_code=204)
def delete_reward(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reward = db.query(Reward).filter(
        Reward.reward_id == reward_id,
        Reward.user_id == current_user.user_id
    ).first()

    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    db.delete(reward)
    db.commit()
    return None

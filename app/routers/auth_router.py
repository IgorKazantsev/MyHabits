from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.auth.auth_bcrypt import hash_password, verify_password
from app.auth.auth_handler import create_access_token
from app.log import logger
import time

# ✅ Добавлен prefix
router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# Получение сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔐 Регистрация пользователя
@router.post("/register", response_model=UserResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):
    logger.info("🔹 START REGISTER ROUTE")
    logger.info(f"📩 Received data: {user.dict()}")
    start = time.time()

    try:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            logger.warning("⚠️ Email already registered")
            raise HTTPException(status_code=400, detail="Email already registered")

        new_user = User(
            username=user.username,
            email=user.email,
            password_hash=hash_password(user.password),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info("✅ User registered successfully")
        return UserResponse(
            user_id=new_user.user_id,
            username=new_user.username,
            email=new_user.email
        )

    except Exception as e:
        logger.error(f"❌ ERROR during registration: {e}")
        raise HTTPException(status_code=500, detail="Ошибка на сервере при регистрации")

    finally:
        elapsed = round(time.time() - start, 2)
        logger.info(f"⬅️ Completed in {elapsed}s")

# 🔐 Логин и получение JWT-токена
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    logger.info("🔹 START LOGIN ROUTE")
    logger.info(f"📩 Attempt login: {user.email}")
    start = time.time()

    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user or not verify_password(user.password, db_user.password_hash):
            logger.warning("❌ Invalid credentials")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(data={"user_id": db_user.user_id})

        logger.info("✅ Login successful")

        # ⬇️ Возвращаем токен + роль
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": db_user.role  # ⬅️ Добавлено!
        }

    except Exception as e:
        logger.error(f"❌ ERROR during login: {e}")
        raise HTTPException(status_code=500, detail="Ошибка на сервере при входе")

    finally:
        elapsed = round(time.time() - start, 2)
        logger.info(f"⬅️ Completed in {elapsed}s")


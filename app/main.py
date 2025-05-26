from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
import time

from app.routers import auth_router
from app.routers import habit_router
from app.routers import reward_router
from app.routers import habit_log_router
from app.routers import admin_router


app = FastAPI()


# 🔥 Добавляем CORS здесь сразу после создания app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Пока разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Логирование всех запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"➡️ Incoming request: {request.method} {request.url}")
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time
    print(f"⬅️ Completed in {duration:.2f}s with status {response.status_code}")
    return response

# 📌 Подключаем роутеры (префикс уже внутри файла)
app.include_router(auth_router.router)          # <-- без prefix
app.include_router(habit_router.router)
app.include_router(reward_router.router)
app.include_router(habit_log_router.router)
app.include_router(admin_router.router)
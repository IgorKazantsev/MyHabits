import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from sqlalchemy.exc import OperationalError

# 🔹 Загрузка .env
load_dotenv()

# 🔹 Получение параметров из .env
server = os.getenv("DB_HOST")
port = os.getenv("DB_PORT", "1433")
database = os.getenv("DB_DATABASE")
username = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
driver = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")

# 🔹 Проверка обязательных переменных
required_vars = {"DB_HOST": server, "DB_DATABASE": database, "DB_USER": username, "DB_PASSWORD": password}
missing_vars = [key for key, value in required_vars.items() if not value]
if missing_vars:
    raise EnvironmentError(f"❌ Missing environment variables: {', '.join(missing_vars)}")

# 🔹 Формирование строки подключения
params = urllib.parse.quote_plus(
    f"DRIVER={driver};SERVER={server},{port};DATABASE={database};UID={username};PWD={password}"
)

DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

# 🔹 Создание движка
try:
    engine = create_engine(DATABASE_URL)
except OperationalError as e:
    raise RuntimeError("❌ Не удалось подключиться к базе данных") from e

# 🔹 Создание сессии
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 🔹 Базовый класс для моделей
Base = declarative_base()

# ✅ Вот это нужно добавить!
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

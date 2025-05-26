from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = (
    "mssql+pyodbc://igkaza:t231808@mail.vk.edu.ee:1433/MyHabitsDB"
    "?driver=ODBC+Driver+17+for+SQL+Server"
)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("✅ Успешное подключение к базе данных!")
except SQLAlchemyError as e:
    print("❌ Ошибка подключения:", e)

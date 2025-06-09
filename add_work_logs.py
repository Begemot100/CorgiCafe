import sqlite3
from datetime import datetime, timedelta

# Путь к базе данных
db_path = '/Users/germany/corgigotico1/instance/database.db'

# Создаем соединение с базой данных
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Проверка существования таблицы, если нет - создание
cursor.execute("""
    CREATE TABLE IF NOT EXISTS work_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        log_date TEXT,
        check_in_time TEXT,
        check_out_time TEXT,
        worked_hours REAL DEFAULT 0,
        FOREIGN KEY (employee_id) REFERENCES employee(id)
    )
""")

# Данные для сотрудников
employee_ids = range(1, 11)  # Сотрудники с id от 1 до 10

# Начальная дата для рабочего дня
start_date = datetime(2025, 6, 1)  # Начнем с 1 июня 2025 года

# Добавление рабочих дней для каждого сотрудника
for employee_id in employee_ids:
    for day in range(20):  # 20 рабочих дней
        log_date = start_date + timedelta(days=day)  # Считаем дату для каждого рабочего дня

        # Преобразуем строки времени в объекты time и далее в строки в ISO формате
        check_in_time = datetime.strptime('09:00:00', '%H:%M:%S').time().strftime('%H:%M:%S')  # Чек-ин
        check_out_time = datetime.strptime('17:00:00', '%H:%M:%S').time().strftime('%H:%M:%S')  # Чек-аут

        # Вставляем данные о рабочем дне в таблицу work_log
        try:
            cursor.execute("""
                INSERT INTO work_log (employee_id, log_date, check_in_time, check_out_time)
                VALUES (?, ?, ?, ?)
            """, (employee_id, log_date.strftime('%Y-%m-%d'), check_in_time, check_out_time))
        except sqlite3.Error as e:
            print(f"Ошибка при добавлении рабочего дня для сотрудника {employee_id}: {e}")

# Сохраняем изменения в базе данных
conn.commit()

# Закрываем соединение с базой данных
conn.close()

print("Рабочие дни успешно добавлены в базу данных.")

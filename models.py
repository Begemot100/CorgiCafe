# from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import hashlib
from sqlalchemy import DateTime
# from datetime import datetime
from datetime import datetime, date, time, timedelta
db = SQLAlchemy()


# Модель администратора
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Модель пользователя с доступом только к дашборду
class DashboardUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Модель сотрудника
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    nie = db.Column(db.String(20), nullable=False, unique=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    days_per_week = db.Column(db.Integer, nullable=False, default=5)
    position = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    section = db.Column(db.String(50), nullable=False)
    check_in_time = db.Column(db.Time, nullable=True)
    check_out_time = db.Column(db.Time, nullable=True)
    daily_hours = db.Column(db.Float, default=0)
    monthly_hours = db.Column(db.Float, default=0)
    work_start_time = db.Column(db.Time, nullable=False)
    work_end_time = db.Column(db.Time, nullable=False)
    total_hours = db.Column(db.Float, default=0)
    total_days = db.Column(db.Integer, default=0)
    paid_holidays = db.Column(db.Integer, default=0)
    unpaid_holidays = db.Column(db.Integer, default=0)

    work_logs = db.relationship('WorkLog', backref='employee', cascade="all, delete-orphan", lazy=True)

    def __repr__(self):
        return f'<Employee {self.full_name}>'


# Модель кафе
class Cafe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    instagram = db.Column(db.String(100), nullable=True)  # Instagram-аккаунт
    telegram = db.Column(db.String(100), nullable=True)   # Telegram-аккаунт


class WorkLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    log_date = db.Column(db.Date, nullable=False)
    check_in_time = db.Column(db.DateTime, nullable=True)
    check_out_time = db.Column(db.DateTime, nullable=True)
    worked_hours = db.Column(db.Float)
    holidays = db.Column(db.String(50))

    def calculate_worked_hours(self):
        if self.check_in_time and self.check_out_time:
            # Ensure check_in_time and check_out_time are datetime.time objects
            check_in = self.check_in_time if isinstance(self.check_in_time, time) else self.check_in_time.time()
            check_out = self.check_out_time if isinstance(self.check_out_time, time) else self.check_out_time.time()

            # Combine time with log_date to create full datetime objects
            check_in_datetime = datetime.combine(self.log_date, check_in)
            check_out_datetime = datetime.combine(self.log_date, check_out)

            # Handle cases where check-out is the next day (e.g., night shifts)
            if check_out_datetime < check_in_datetime:
                check_out_datetime += timedelta(days=1)

            # Calculate the difference
            delta = check_out_datetime - check_in_datetime
            self.worked_hours = delta.total_seconds() / 3600  # Convert to hours
        else:
            self.worked_hours = 0

# Модель профиля
class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cafe_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    telegram = db.Column(db.String(100), nullable=True)
    instagram = db.Column(db.String(100), nullable=True)



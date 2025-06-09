from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    nie = db.Column(db.String(20), unique=True, nullable=False)
    position = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120), unique=True)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    section = db.Column(db.String(50))
    work_start_time = db.Column(db.Time)
    work_end_time = db.Column(db.Time)
    days_per_week = db.Column(db.Integer, nullable=True)


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class DashboardUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class WorkLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employee.id"), nullable=False)
    log_date = db.Column(db.Date, nullable=False)
    check_in_time = db.Column(db.DateTime)
    check_out_time = db.Column(db.DateTime)
    worked_hours = db.Column(db.Float, default=0.0)
    holidays = db.Column(db.String(20), default="workingday")

    def calculate_worked_hours(self):
        if self.check_in_time and self.check_out_time:
            delta = self.check_out_time - self.check_in_time
            self.worked_hours = round(delta.total_seconds() / 3600, 2)
        else:
            self.worked_hours = 0.0

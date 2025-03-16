# fix_worklog_times.py
from app import app, db
from models import WorkLog
from datetime import datetime

with app.app_context():
    work_logs = WorkLog.query.all()
    for log in work_logs:
        if log.check_in_time and isinstance(log.check_in_time, datetime):
            log.check_in_time = log.check_in_time.time()
        if log.check_out_time and isinstance(log.check_out_time, datetime):
            log.check_out_time = log.check_out_time.time()
        log.calculate_worked_hours()
    db.session.commit()
    print("Data migration complete")
import logging
import os
import sys
import time
from datetime import date

from flask import Flask, render_template
from flask_apscheduler import APScheduler

from models import Employee, WorkLog, db
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.employee import employee_bp
from routes.worklog import worklog_bp

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
TEMPLATE_FOLDER = os.path.join(BASE_DIR, "templates")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
app.config.from_object("config.Config")
app.config["PROPAGATE_EXCEPTIONS"] = True
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/germany/corgigotico1/instance/database.db'

# Validate configuration
if not app.config.get("SQLALCHEMY_DATABASE_URI"):
    logger.error(" SQLALCHEMY_DATABASE_URI not configured in config.py")
    sys.exit(1)

# Initialize database
logger.info(f" Connecting to database: {app.config['SQLALCHEMY_DATABASE_URI']}")
try:
    db.init_app(app)
except Exception as e:
    logger.error(f" Database initialization error: {e}")
    sys.exit(1)

# Initialize APScheduler
scheduler = APScheduler()
try:
    scheduler.init_app(app)
except Exception as e:
    logger.error(f" Scheduler initialization error: {e}")
    sys.exit(1)

# Create database tables
start_time = time.time()
with app.app_context():
    try:
        db.create_all()
        logger.info(" Database tables created")
    except Exception as e:
        logger.error(f" Error creating tables: {e}")
        sys.exit(1)
logger.info(f"⏱️ Table creation took: {time.time() - start_time:.2f} seconds")


# Scheduler job to reset and create daily work logs
def reset_and_create_logs():
    with app.app_context():
        try:
            start_time = time.time()
            today = date.today()
            employees = Employee.query.all()
            for emp in employees:
                work_log = WorkLog.query.filter_by(
                    employee_id=emp.id, log_date=today
                ).first()
                if work_log:
                    work_log.check_in_time = None
                    work_log.check_out_time = None
                    work_log.worked_hours = 0
                else:
                    new_log = WorkLog(
                        employee_id=emp.id, log_date=today, worked_hours=0
                    )
                    db.session.add(new_log)
            db.session.commit()
            logger.info(f"🔄 Employee data reset and logs created for {today}")
            logger.info(
                f"⏱️ reset_and_create_logs took: {time.time() - start_time:.2f} seconds"
            )
        except Exception as e:
            logger.error(f"❌ Error in reset_and_create_logs: {e}")
            db.session.rollback()


# Start scheduler
start_time = time.time()
if not scheduler.running:
    try:
        scheduler.add_job(
            id="reset_and_create_logs",
            func=reset_and_create_logs,
            trigger="cron",
            hour=0,
            minute=1,
        )
        scheduler.start()
        logger.info("✅ Scheduler started")
    except Exception as e:
        logger.error(f"❌ Scheduler start error: {e}")
        sys.exit(1)
logger.info(f"⏱️ Scheduler startup took: {time.time() - start_time:.2f} seconds")

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(employee_bp)
app.register_blueprint(worklog_bp)
app.register_blueprint(dashboard_bp)


# Custom template filter for formatting hours
@app.template_filter("format_hours")
def format_hours(value):
    if value is None or value == 0:
        return "0h 0min"
    hours = int(value)
    minutes = int((value - hours) * 60)
    return f"{hours}h {minutes}min"


# Home route
@app.route("/")
def home():
    return render_template("home.html")


if __name__ == "__main__":
    try:
        app.run(debug=True, port=5002, host="0.0.0.0")
        logger.info("✅ Application started on port 5001")
    except Exception as e:
        logger.error(f"❌ Application startup error: {e}")
        sys.exit(1)

import logging
import os
from datetime import date

from flask import Blueprint, current_app, jsonify, render_template

from models import Employee, WorkLog, db
from routes.auth import role_required

# Define module-level logger
logger = logging.getLogger(__name__)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard")
@role_required(["admin"])
def admin_panel():
    try:
        employees = Employee.query.all()
        if employees is None:
            employees = []

        logger.info(f"🔍 Loaded employees: {len(employees)}")
        try:
            logger.info(f"🔍 Loaded employees: {len(employees)}")

            return render_template('index.html', employees=employees)
        except Exception as template_error:
            logger.error(f"❌ Template rendering error: {template_error}")
            raise
    except Exception as e:
        logger.error(f"❌ Error in admin_panel: {e}")
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/board")
@role_required(["worker", "admin"])
def board():
    try:
        today = date.today()
        employees = Employee.query.all()
        dashboard_data = []
        for employee in employees:
            work_log = WorkLog.query.filter_by(
                employee_id=employee.id, log_date=today
            ).first()
            if not work_log:
                work_log = WorkLog(
                    employee_id=employee.id, log_date=today, worked_hours=0.0
                )
                db.session.add(work_log)
                db.session.commit()
            dashboard_data.append(
                {
                    "employee": employee,
                    "check_in_time": (
                        work_log.check_in_time.strftime("%H:%M")
                        if work_log.check_in_time
                        else "--:--"
                    ),
                    "check_out_time": (
                        work_log.check_out_time.strftime("%H:%M")
                        if work_log.check_out_time
                        else "--:--"
                    ),
                    "daily_hours": round(work_log.worked_hours or 0, 2),
                }
            )
            print("💡 TEMPLATE PATH:", current_app.template_folder)
            print("📁 TEMPLATES DIR LISTING:", os.listdir(current_app.template_folder))
        return render_template(
            "board.html", dashboard_data=dashboard_data, current_date=today
        )
    except Exception as e:
        logger.error(f"❌ Error in board: {e}")  # Use logger
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/dashboard_data")
@role_required(["worker", "admin"])
def get_dashboard_data():
    try:
        today = date.today()
        employees = Employee.query.all()
        data = []
        for emp in employees:
            work_log = WorkLog.query.filter_by(
                employee_id=emp.id, log_date=today
            ).first()
            if not work_log:
                work_log = WorkLog(employee_id=emp.id, log_date=today, worked_hours=0)
                db.session.add(work_log)
                db.session.commit()
            data.append(
                {
                    "id": emp.id,
                    "full_name": emp.full_name,
                    "check_in_time": (
                        work_log.check_in_time.strftime("%H:%M")
                        if work_log.check_in_time
                        else "--:--"
                    ),
                    "check_out_time": (
                        work_log.check_out_time.strftime("%H:%M")
                        if work_log.check_out_time
                        else "--:--"
                    ),
                    "daily_hours": round(work_log.worked_hours or 0, 2),
                }
            )
        return jsonify(data)
    except Exception as e:
        logger.error(f"❌ Error in get_dashboard_data: {e}")  # Use logger
        return jsonify({"error": str(e)}), 500

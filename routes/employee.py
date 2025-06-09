import logging
from datetime import datetime

from flask import Blueprint, jsonify, request

from config import Config
from models import Employee, db
from routes.auth import role_required

logger = logging.getLogger(__name__)
employee_bp = Blueprint("employee", __name__)


@employee_bp.route("/employees")
@role_required(["admin"])
def get_employees():
    try:
        employees = Employee.query.all()
        return jsonify(
            [
                {
                    "id": emp.id,
                    "full_name": emp.full_name,
                    "nie": emp.nie,
                    "position": emp.position,
                    "phone": emp.phone,
                    "email": emp.email,
                    "start_date": (
                        emp.start_date.strftime("%Y-%m-%d") if emp.start_date else ""
                    ),
                    "work_start_time": (
                        emp.work_start_time.strftime("%H:%M")
                        if emp.work_start_time
                        else ""
                    ),
                    "work_end_time": (
                        emp.work_end_time.strftime("%H:%M") if emp.work_end_time else ""
                    ),
                }
                for emp in employees
            ]
        )
    except Exception as e:
        Config.logger.error(f"❌ Error in get_employees: {e}")
        return jsonify({"error": str(e)}), 500


@employee_bp.route("/employee/add", methods=["POST"])
@role_required(["admin"])
def add_employee():
    try:
        form_data = request.form.to_dict()
        logger.debug(f"Form data received: {form_data}")
        nie = request.form.get("nie")
        email = request.form.get("email")
        full_name = request.form.get("full_name")
        if not nie or not full_name or not email:
            logger.error("Missing required fields: nie, full_name, and email")
            return (
                jsonify(
                    {"error": "Missing required fields: NIE, Full Name, and Email"}
                ),
                400,
            )
        if Employee.query.filter_by(nie=nie).first():
            logger.warning(f"Duplicate NIE: {nie}")
            return jsonify({"error": f"Employee with NIE {nie} already exists"}), 400
        if Employee.query.filter_by(email=email).first():
            logger.warning(f"Duplicate Email: {email}")
            return (
                jsonify({"error": f"Employee with Email {email} already exists"}),
                400,
            )
        position = request.form.get("position")
        phone = request.form.get("phone")
        start_date = request.form.get("start_date")
        end_date = request.form.get("end_date")
        section = request.form.get("section")
        work_start_time = request.form.get("work_start_time")
        work_end_time = request.form.get("work_end_time")
        days_per_week = request.form.get("days_per_week")
        if not days_per_week:
            logger.error("Missing required field: days_per_week")
            return jsonify({"error": "Days per week is required"}), 400
        if (
            not position
            or not section
            or not phone
            or not work_start_time
            or not work_end_time
        ):
            logger.error(
                "Missing required fields: position, section, phone, work_start_time, work_end_time"
            )
            return (
                jsonify(
                    {
                        "error": "Missing required fields: Position, Section, Phone, Work Start/End Time"
                    }
                ),
                400,
            )
        try:
            days_per_week = int(days_per_week)
            if not (1 <= days_per_week <= 7):
                raise ValueError("Days per week must be between 1 and 7")
            start_date = (
                datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
            )
            end_date = (
                datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None
            )
            work_start_time = (
                datetime.strptime(work_start_time, "%H:%M").time()
                if work_start_time
                else None
            )
            work_end_time = (
                datetime.strptime(work_end_time, "%H:%M").time()
                if work_end_time
                else None
            )
        except ValueError as ve:
            logger.error(f"Invalid format: {ve}")
            return (
                jsonify({"error": "Invalid date, time, or days per week format"}),
                400,
            )
        new_employee = Employee(
            full_name=full_name,
            nie=nie,
            position=position,
            phone=phone,
            email=email,
            start_date=start_date,
            end_date=end_date,
            section=section,
            work_start_time=work_start_time,
            work_end_time=work_end_time,
            days_per_week=days_per_week,
        )
        db.session.add(new_employee)
        db.session.commit()
        logger.info(f"Employee added: {full_name}, NIE={nie}")
        return jsonify(
            {
                "message": "Employee added successfully!",
                "employee": {
                    "id": new_employee.id,
                    "full_name": new_employee.full_name,
                    "nie": new_employee.nie,
                    "start_date": (
                        new_employee.start_date.strftime("%Y-%m-%d")
                        if new_employee.start_date
                        else ""
                    ),
                    "work_start_time": (
                        new_employee.work_start_time.strftime("%H:%M")
                        if new_employee.work_start_time
                        else ""
                    ),
                    "work_end_time": (
                        new_employee.work_end_time.strftime("%H:%M")
                        if new_employee.work_end_time
                        else ""
                    ),
                    "days_per_week": new_employee.days_per_week,
                    "position": new_employee.position,
                    "section": new_employee.section,
                    "phone": new_employee.phone,
                    "email": new_employee.email,
                },
            }
        )
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error in add_employee: {e}")
        return jsonify({"error": str(e)}), 500


@employee_bp.route("/employee/edit/<int:id>", methods=["POST"])
@role_required(["admin"])
def edit_employee(id):
    try:
        employee = db.session.get(Employee, id)
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        full_name = request.form.get("full_name", employee.full_name)
        nie = request.form.get("nie", employee.nie)
        phone = request.form.get("phone", employee.phone)
        position = request.form.get("position", employee.position)
        email = request.form.get("email", employee.email)
        section = request.form.get("section", employee.section)
        days_per_week = request.form.get("days_per_week", employee.days_per_week)
        start_date = request.form.get("start_date")
        end_date = request.form.get("end_date")
        work_start_time = request.form.get("work_start_time")
        work_end_time = request.form.get("work_end_time")

        try:
            days_per_week = (
                int(days_per_week) if days_per_week else employee.days_per_week
            )
            if days_per_week and not (1 <= days_per_week <= 7):
                raise ValueError("Days per week must be between 1 and 7")
            start_date = (
                datetime.strptime(start_date, "%Y-%m-%d").date()
                if start_date
                else employee.start_date
            )
            end_date = (
                datetime.strptime(end_date, "%Y-%m-%d").date()
                if end_date
                else employee.end_date
            )
            work_start_time = (
                datetime.strptime(work_start_time, "%H:%M").time()
                if work_start_time
                else employee.work_start_time
            )
            work_end_time = (
                datetime.strptime(work_end_time, "%H:%M").time()
                if work_end_time
                else employee.work_end_time
            )
        except ValueError as ve:
            logger.error(f"Invalid format in edit_employee: {ve}")
            return (
                jsonify({"error": "Invalid date, time, or days per week format"}),
                400,
            )

        # Check for duplicate NIE or email (excluding the current employee)
        if Employee.query.filter(Employee.nie == nie, Employee.id != id).first():
            logger.warning(f"Duplicate NIE: {nie}")
            return jsonify({"error": f"Employee with NIE {nie} already exists"}), 400
        if Employee.query.filter(Employee.email == email, Employee.id != id).first():
            logger.warning(f"Duplicate Email: {email}")
            return (
                jsonify({"error": f"Employee with Email {email} already exists"}),
                400,
            )

        employee.full_name = full_name
        employee.nie = nie
        employee.phone = phone
        employee.position = position
        employee.email = email
        employee.section = section
        employee.days_per_week = days_per_week
        employee.start_date = start_date
        employee.end_date = end_date
        employee.work_start_time = work_start_time
        employee.work_end_time = work_end_time

        db.session.commit()
        logger.info(f"Employee {employee.full_name} updated successfully")
        return jsonify({"message": "Employee updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Error in edit_employee: {e}")
        return jsonify({"error": str(e)}), 500


@employee_bp.route("/employee/<int:employee_id>", methods=["GET"])
@role_required(["admin"])
def get_employee(employee_id):
    try:
        employee = db.session.get(Employee, employee_id)
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        return jsonify(
            {
                "id": employee.id,
                "full_name": employee.full_name,
                "nie": employee.nie,
                "start_date": (
                    employee.start_date.strftime("%Y-%m-%d")
                    if employee.start_date
                    else ""
                ),
                "end_date": (
                    employee.end_date.strftime("%Y-%m-%d") if employee.end_date else ""
                ),
                "work_start_time": (
                    employee.work_start_time.strftime("%H:%M")
                    if employee.work_start_time
                    else ""
                ),
                "work_end_time": (
                    employee.work_end_time.strftime("%H:%M")
                    if employee.work_end_time
                    else ""
                ),
                "days_per_week": employee.days_per_week or 0,
                "position": employee.position,
                "section": employee.section,
                "phone": employee.phone,
                "email": employee.email,
            }
        )
    except Exception as e:
        logger.error(f"❌ Error in get_employee: {e}")
        return jsonify({"error": str(e)}), 500


@employee_bp.route("/delete/<int:employee_id>", methods=["POST"])
@role_required(["admin"])
def delete_employee(employee_id):
    try:
        employee = db.session.get(Employee, employee_id)
        if not employee:
            return jsonify({"error": "Employee not found"}), 404
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": "Employee deleted successfully"}), 200
    except Exception as e:
        Config.logger.error(f"Delete error: {e}")
        db.session.rollback()
        return jsonify({"error": "Server error"}), 500

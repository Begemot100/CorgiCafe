from flask import Flask, request, send_file, jsonify
import pandas as pd
import io
from datetime import datetime
from sqlalchemy import and_
from models import WorkLog, Employee
from app import db, app

@app.route("/export_to_excel", methods=["POST"])
def export_to_excel():
    try:
        data = request.get_json()
        filter_type = data.get("filter_type", "thismonth")
        start_date_str = data.get("start_date", "")
        end_date_str = data.get("end_date", "")
        selected_employee_ids = data.get("selected_employees")

        today = datetime.today().date()
        start_date, end_date = today.replace(day=1), today

        if filter_type == "today":
            start_date = end_date = today
        elif filter_type == "yesterday":
            start_date = end_date = today - timedelta(days=1)
        elif filter_type == "last7days":
            start_date = today - timedelta(days=6)
        elif filter_type == "last30days":
            start_date = today - timedelta(days=29)
        elif filter_type == "thismonth":
            start_date = today.replace(day=1)
        elif filter_type == "lastmonth":
            first_day = today.replace(day=1)
            end_date = first_day - timedelta(days=1)
            start_date = end_date.replace(day=1)
        elif filter_type == "custom" and start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Неверный формат даты"}), 400

        query = WorkLog.query.filter(
            and_(
                WorkLog.log_date >= start_date,
                WorkLog.log_date <= end_date
            )
        )

        if selected_employee_ids:
            query = query.filter(WorkLog.employee_id.in_(selected_employee_ids))

        logs = query.order_by(WorkLog.employee_id, WorkLog.log_date).all()

        if not logs:
            return jsonify({"error": "Нет данных для экспорта"}), 404

        rows = []
        last_employee_id = None

        for log in logs:
            employee = Employee.query.get(log.employee_id)
            if not employee:
                continue

            if last_employee_id and last_employee_id != log.employee_id:
                rows.append([""] * 6)  # Пробел в 2 строки между сотрудниками

            rows.append([
                employee.full_name,
                log.log_date.strftime("%Y-%m-%d"),
                log.check_in_time.strftime("%H:%M") if log.check_in_time else "--:--",
                log.check_out_time.strftime("%H:%M") if log.check_out_time else "--:--",
                f"{log.worked_hours:.2f}h" if log.worked_hours else "0h 0min",
                log.holidays or "Día laboral"
            ])

            last_employee_id = log.employee_id

        df = pd.DataFrame(rows, columns=["Сотрудник", "Дата", "Вход", "Выход", "Часы", "Тип дня"])

        # Автоматическая настройка ширины колонок
        writer = pd.ExcelWriter(io.BytesIO(), engine="xlsxwriter")
        df.to_excel(writer, index=False, sheet_name="Work Logs")

        workbook = writer.book
        worksheet = writer.sheets["Work Logs"]

        for col_num, value in enumerate(df.columns.values):
            column_len = max(df[value].astype(str).map(len).max(), len(value)) + 2
            worksheet.set_column(col_num, col_num, column_len)

        writer.close()

        output = io.BytesIO()
        writer._save(output)
        output.seek(0)

        return send_file(output, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                         as_attachment=True, download_name="Work_Logs.xlsx")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

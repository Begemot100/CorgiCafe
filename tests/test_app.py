import logging
import os
import sys
import unittest
from datetime import date, datetime, time
from unittest.mock import MagicMock, patch

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Ensure app modules are importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models import Employee, WorkLog, db
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.employee import employee_bp
from routes.worklog import worklog_bp

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Flask test config
class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "test-key"


# App factory
def create_app():
    app = Flask(__name__)
    app.config.from_object(TestConfig)
    db.init_app(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(employee_bp)
    app.register_blueprint(worklog_bp)
    return app


app = create_app()
client = app.test_client()


# --- DB setup for module ---
def setUpModule():
    with app.app_context():
        db.create_all()
        if "work_log" not in db.inspect(db.engine).get_table_names():
            raise RuntimeError("Missing table: work_log")


def tearDownModule():
    with app.app_context():
        db.drop_all()


class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        with app.app_context():
            db.drop_all()
            db.create_all()

            employee1 = Employee(
                full_name="Kirill Strelnikov",
                nie="9573838",
                position="Barman",
                phone="123456",
                email="kirill@example.com",
                section="Sala",
            )
            employee2 = Employee(
                full_name="qwe",
                nie="8888888888",
                position="Camarero",
                phone="12:04",
                email="qwe@gmail.com",
                section="Sala",
                start_date=date(2025, 6, 1),
                work_start_time=time(11, 0),
                work_end_time=time(15, 0),
                days_per_week=5,
            )

            db.session.add_all([employee1, employee2])
            db.session.commit()

            self.employee1_id = employee1.id
            self.employee2_id = employee2.id

    def tearDown(self):
        with app.app_context():
            db.session.remove()

    # --- Models ---

    def test_employee_model(self):
        with app.app_context():
            employee = db.session.get(Employee, self.employee1_id)
            self.assertEqual(employee.full_name, "Kirill Strelnikov")

    def test_worklog_model(self):
        with app.app_context():
            work_log = WorkLog(
                employee_id=self.employee1_id,
                log_date=date.today(),
                check_in_time=datetime.now(),
            )
            db.session.add(work_log)
            db.session.commit()
            fetched_log = db.session.get(WorkLog, work_log.id)
            self.assertEqual(fetched_log.employee_id, self.employee1_id)
            self.assertIsNotNone(fetched_log.check_in_time)

    # --- Routes ---

    def test_admin_login(self):
        with app.app_context():
            with app.test_client() as client, patch(
                "routes.auth.Admin.query"
            ) as mock_query:
                mock_query.filter_by.return_value.first.return_value = MagicMock(
                    check_password=lambda x: True
                )
                response = client.post(
                    "/admin_login",
                    data={"email": "admin@example.com", "password": "test"},
                    follow_redirects=True,
                )
                self.assertEqual(response.status_code, 200)

    def test_get_employee(self):
        with client.session_transaction() as sess:
            sess["role"] = "admin"
        response = client.get(f"/employee/{self.employee1_id}")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["full_name"], "Kirill Strelnikov")

    def test_add_employee(self):
        with client.session_transaction() as sess:
            sess["role"] = "admin"
        data = {
            "full_name": "Test User",
            "nie": "12345678",
            "position": "Cocinero",
            "phone": "987654",
            "email": "test@example.com",
            "start_date": "2025-06-10",
            "work_start_time": "09:00",
            "work_end_time": "17:00",
            "days_per_week": "5",
            "section": "Cocina",
        }
        response = client.post("/employee/add", data=data)
        self.assertEqual(response.status_code, 200)
        with app.app_context():
            self.assertEqual(
                db.session.query(Employee).filter_by(nie="12345678").count(), 1
            )

    def test_edit_employee(self):
        with client.session_transaction() as sess:
            sess["role"] = "admin"
        edit_data = {
            "full_name": "Updated Name",
            "nie": "11111111",
            "position": "Chef",
            "phone": "123123",
            "email": "updated@example.com",
            "start_date": "2025-06-12",
            "work_start_time": "10:00",
            "work_end_time": "18:00",
            "days_per_week": "5",
            "section": "Cocina",
        }
        response = client.post(f"/employee/edit/{self.employee1_id}", data=edit_data)
        self.assertEqual(response.status_code, 200)
        with app.app_context():
            updated = db.session.get(Employee, self.employee1_id)
            self.assertEqual(updated.full_name, "Updated Name")

    def test_check_in_and_out(self):
        with client.session_transaction() as sess:
            sess["role"] = "admin"

        response_in = client.post(f"/check_in/{self.employee1_id}")
        self.assertEqual(response_in.status_code, 200)

        response_out = client.post(f"/check_out/{self.employee1_id}")
        self.assertEqual(response_out.status_code, 200)

        with app.app_context():
            log = (
                db.session.query(WorkLog)
                .filter_by(employee_id=self.employee1_id, log_date=date.today())
                .first()
            )
            self.assertIsNotNone(log.check_out_time)

    def test_dashboard(self):
        with client.session_transaction() as sess:
            sess["role"] = "admin"
        response = client.get("/dashboard")
        self.assertEqual(response.status_code, 200)

    def test_board(self):
        with client.session_transaction() as sess:
            sess["role"] = "worker"
        response = client.get("/board")
        self.assertEqual(response.status_code, 200)

    def test_work(self):
        with client.session_transaction() as sess:
            sess["role"] = "worker"
        response = client.get("/work")
        self.assertEqual(response.status_code, 302)

    # --- Edge cases ---

    def test_duplicate_nie(self):
        with client.session_transaction() as sess:
            sess["role"] = "admin"
        data = {
            "full_name": "Dup Test",
            "nie": "9573838",  # duplicate
            "position": "Cocinero",
            "phone": "000",
            "email": "dup@example.com",
            "start_date": "2025-06-10",
            "work_start_time": "09:00",
            "work_end_time": "17:00",
            "days_per_week": "5",
            "section": "Cocina",
        }
        response = client.post("/employee/add", data=data)
        self.assertEqual(response.status_code, 400)

    def test_invalid_days(self):
        with client.session_transaction() as sess:
            sess["role"] = "admin"
        data = {
            "full_name": "Invalid Days",
            "nie": "11223344",
            "position": "Cocinero",
            "phone": "0000000",
            "email": "invalid@example.com",
            "start_date": "2025-06-10",
            "work_start_time": "09:00",
            "work_end_time": "17:00",
            "days_per_week": "8",  # invalid
            "section": "Cocina",
        }
        response = client.post("/employee/add", data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"Invalid", response.data)


if __name__ == "__main__":
    unittest.main()

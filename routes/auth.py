import logging
from functools import wraps

from flask import (Blueprint, jsonify, redirect, render_template, request,
                   session, url_for)

from config import Config
from models import Admin, DashboardUser, db

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)


# Role-based access decorator
def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user_role = session.get("role")
            if not user_role:
                return redirect(
                    url_for(
                        "auth.worker_login"
                        if "worker" in allowed_roles
                        else "auth.admin_login"
                    )
                )
            if user_role not in allowed_roles:
                return redirect(
                    url_for(
                        "dashboard.board"
                        if user_role == "worker"
                        else "auth.admin_login"
                    )
                )
            return func(*args, **kwargs)

        return wrapper

    return decorator


@auth_bp.route("/admin_register", methods=["GET", "POST"])
def admin_register():
    try:
        if request.method == "POST":
            email = request.form.get("email")
            password = request.form.get("password")
            confirm_password = request.form.get("confirm_password")

            if password != confirm_password:
                return jsonify({"error": "Passwords do not match"}), 400

            if Admin.query.filter_by(email=email).first():
                return jsonify({"error": "Admin with this email already exists"}), 400

            admin = Admin(email=email)
            admin.set_password(password)
            db.session.add(admin)
            db.session.commit()
            return redirect(url_for("auth.admin_login"))

        return render_template("admin_register.html")
    except Exception as e:
        Config.logger.error(f" Error in admin_register: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/admin_login", methods=["GET", "POST"])
def admin_login():
    try:
        if request.method == "GET":
            return render_template("admin_login.html")

        email = request.form["email"]
        password = request.form["password"]
        admin = Admin.query.filter_by(email=email).first()
        if admin and admin.check_password(password):
            session["role"] = "admin"
            logger.info(f"Admin logged in: {email}")
            return redirect(url_for("dashboard.admin_panel"))
        logger.error(f"Login failed: {email}")
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        logger.error(f"Error in admin_login: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/worker_register", methods=["GET", "POST"])
def worker_register():
    try:
        if request.method == "POST":
            username = request.form.get("username")
            password = request.form.get("password")
            confirm_password = request.form.get("confirm_password")

            if password != confirm_password:
                return jsonify({"error": "Passwords do not match"}), 400

            if DashboardUser.query.filter_by(username=username).first():
                return (
                    jsonify({"error": "Worker with this username already exists"}),
                    400,
                )

            worker = DashboardUser(username=username, role="worker")
            worker.set_password(password)
            db.session.add(worker)
            db.session.commit()
            return redirect(url_for("auth.worker_login"))

        return render_template("worker_register.html")
    except Exception as e:
        Config.logger.error(f" Error in worker_register: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/worker_login", methods=["GET", "POST"])
def worker_login():
    try:
        if request.method == "POST":
            username = request.form.get("username")
            password = request.form.get("password")
            user = DashboardUser.query.filter_by(username=username).first()

            if user and user.check_password(password):
                session.permanent = True
                session["user_id"] = user.id
                session["role"] = user.role
                return redirect(
                    url_for(
                        "dashboard.board"
                        if user.role == "worker"
                        else "dashboard.admin_panel"
                    )
                )
            return jsonify({"error": "Invalid credentials"}), 401

        return render_template("worker_login.html")
    except Exception as e:
        Config.logger.error(f" Error in worker_login: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/logout")
def logout():
    try:
        session.clear()
        return redirect(url_for("auth.admin_login"))
    except Exception as e:
        Config.logger.error(f" Error in logout: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/worker_logout")
def worker_logout():
    try:
        session.clear()
        return redirect(url_for("auth.worker_login"))
    except Exception as e:
        Config.logger.error(f" Error in worker_logout: {e}")
        return jsonify({"error": str(e)}), 500

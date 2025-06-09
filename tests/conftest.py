import os

import pytest

from app import app as original_app
from app import db

TEMPLATE_FOLDER = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../templates")
)
STATIC_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "../static"))

original_app.template_folder = TEMPLATE_FOLDER
original_app.static_folder = STATIC_FOLDER

flask_app = original_app
from models import Employee

flask_app.template_folder = TEMPLATE_FOLDER


@pytest.fixture
def app():
    flask_app.config.update(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "WTF_CSRF_ENABLED": False,
            "SECRET_KEY": "test_key",
        }
    )
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()

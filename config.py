import os
import logging


class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = (
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'database.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY") or "your-secret-key"
    SCHEDULER_API_ENABLED = True
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)

    # Create a console handler for logging to the console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    # Create a formatter and add it to the handler
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)

    # Add the console handler to the logger
    logger.addHandler(console_handler)
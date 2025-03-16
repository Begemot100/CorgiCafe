import os
class Config:
    """Основные настройки приложения"""
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Kir100@localhost/corgi_db"
    ).replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "supersecretkey" # Защита сессий и CSRF-токенов

    # Настройки для загрузки файлов (если нужны)
    UPLOAD_FOLDER = "static/uploads"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Максимальный размер файла — 16MB

    # Логирование (если нужно)
    LOGGING_LEVEL = "DEBUG"  # Можно поменять на "INFO" или "ERROR"
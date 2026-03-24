"""アプリケーション設定"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """アプリケーション設定クラス"""

    # プロジェクト情報
    PROJECT_NAME: str = "FastAPI App"
    VERSION: str = "0.1.0"

    # データベース
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/dbname"

    # セキュリティ
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

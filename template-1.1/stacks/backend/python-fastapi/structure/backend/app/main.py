"""FastAPI アプリケーションのエントリーポイント"""

import logging
import traceback
from contextlib import asynccontextmanager
from logging.handlers import RotatingFileHandler
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import settings

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def _setup_file_logging():
    """ファイルログハンドラを設定（ワーカープロセスごとに呼び出される）"""
    project_root = Path(__file__).parent.parent
    logs_dir = project_root / "logs"
    logs_dir.mkdir(exist_ok=True)

    # 既にファイルハンドラが追加されているかチェック
    root_logger = logging.getLogger()
    for handler in root_logger.handlers:
        if isinstance(handler, RotatingFileHandler):
            return  # 既に追加済み

    file_handler = RotatingFileHandler(
        logs_dir / "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    ))
    root_logger.addHandler(file_handler)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # ファイルログハンドラを設定（各ワーカーで実行）
    _setup_file_logging()

    # 起動時の処理
    logger.info(f"🚀 {settings.PROJECT_NAME} を起動しています...")
    yield
    # 終了時の処理
    logger.info(f"👋 {settings.PROJECT_NAME} を終了します")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# グローバル例外ハンドラ（500エラー等のキャッチ）
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """未処理の例外をキャッチしてログ出力"""
    error_detail = (
        f"Unhandled exception\n"
        f"  Method: {request.method}\n"
        f"  URL: {request.url}\n"
        f"  Client: {request.client.host if request.client else 'unknown'}\n"
        f"  Error: {type(exc).__name__}: {exc}\n"
        f"  Traceback:\n{traceback.format_exc()}"
    )
    logger.error(error_detail)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


# HTTPExceptionハンドラ（4xx/5xxエラーのログ出力）
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTPExceptionをログ出力"""
    if exc.status_code >= 500:
        logger.error(
            f"HTTP {exc.status_code}: {request.method} {request.url} - {exc.detail}"
        )
    elif exc.status_code >= 400:
        logger.warning(
            f"HTTP {exc.status_code}: {request.method} {request.url} - {exc.detail}"
        )

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


# APIルーター登録
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}

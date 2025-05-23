import secrets
import logging
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from fastapi import Header, Cookie

active_tokens = {}
TOKEN_EXPIRATION_MINUTES = 60
logger = logging.getLogger("token_manager")


def create_token():
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=TOKEN_EXPIRATION_MINUTES
    )
    active_tokens[token] = expires_at
    return token


def verify_cookie_token(chat_token: str = Cookie(None)):
    if not chat_token or chat_token not in active_tokens:
        logger.warning("Invalid or missing chat token")
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid token"},
        )

    if active_tokens[chat_token] < datetime.now(timezone.utc):
        del active_tokens[chat_token]
        raise HTTPException(status_code=401, detail={"error": "Token expired"})


csrf_tokens = {}


def generate_csrf_token():
    token = secrets.token_urlsafe(32)
    csrf_tokens[token] = datetime.now(timezone.utc) + timedelta(
        minutes=TOKEN_EXPIRATION_MINUTES
    )
    return token


def verify_csrf_cookie(
    x_csrf_token: str = Header(None), csrf_token: str = Cookie(None)
):
    if not x_csrf_token or not csrf_token or x_csrf_token != csrf_token:
        logger.warning("Invalid or missing CSRF token")
        raise HTTPException(status_code=403, detail={"error": "Invalid token"})

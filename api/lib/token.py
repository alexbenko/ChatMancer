import secrets
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from fastapi import Cookie
# Session token storage
active_tokens = {}

TOKEN_EXPIRATION_MINUTES = 60
def create_token():
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
    active_tokens[token] = expires_at
    return token


def verify_cookie_token(chat_token: str = Cookie(None)):
    if not chat_token or chat_token not in active_tokens:
        raise HTTPException(status_code=400, detail=">:(")

    if active_tokens[chat_token] < datetime.now(timezone.utc):
        del active_tokens[chat_token]
        raise HTTPException(status_code=401, detail="Session expired")
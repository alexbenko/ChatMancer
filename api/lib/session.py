
from models.customchathistory import CustomChatMessageHistory

CHAT_HISTORIES = {}
def get_session_history(session_id: str) -> CustomChatMessageHistory:
    if session_id not in CHAT_HISTORIES:
        CHAT_HISTORIES[session_id] = CustomChatMessageHistory()
    return CHAT_HISTORIES[session_id]
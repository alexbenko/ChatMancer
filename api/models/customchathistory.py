from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage


# this way it will track which model was used for each message
class CustomChatMessageHistory(BaseChatMessageHistory):
    def __init__(self):
        self.messages = []

    def add_user_message(self, content: str):
        self.messages.append(
            {"type": "human", "content": content, "model": None, "content_type": "text"}
        )

    def add_ai_message(
        self, content: str, model: str = None, content_type: str = "text"
    ):
        self.messages.append(
            {
                "type": "ai",
                "content": content,
                "model": model,
                "content_type": content_type,
            }
        )

    def add_message(self, message: BaseMessage):
        # fallback for LangChain internals
        self.messages.append(
            {
                "type": message.type,
                "content": message.content,
                "model": None,
                "content_type": "text",
            }
        )

    def clear(self):
        self.messages = []

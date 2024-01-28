from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain, ConversationChain
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain.memory import ConversationBufferMemory

def chat_message_history_to_dict(chat_message_history):
    return {
        "messages": [
            {
                "type": message['type'],
                "content": message['content']
            }
            for message in chat_message_history['chat_memory']['messages']
        ]
    }

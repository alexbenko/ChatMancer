from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain, ConversationChain
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain.memory import ConversationBufferMemory
from flask_restful import Resource
from flask import session, request
from dotenv import load_dotenv
class Chat(Resource):
    def __init__(self, conversation: LLMChain, *args, **kwargs):
        super().__init__()
        self.conversation = conversation
        print('INCLASS: ', self.conversation.memory.dict())
        load_dotenv()

    def get(self):
        conversation = self.conversation
        chat_history = chat_message_history_to_dict(conversation.memory.dict())
        return {"chat_history": chat_history}

    def post(self):
        question = request.json.get('question')
        conversation = self.conversation
        response = conversation.invoke({"question": question})
        return {"response": response['text']}


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

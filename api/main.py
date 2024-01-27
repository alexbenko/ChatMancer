from fastapi import FastAPI, HTTPException
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory
import os
from resources.chatbot import chat_message_history_to_dict
import json
# Define a model for request body
class ChatIn(BaseModel):
    question: str

# Define a model for response
class ChatOut(BaseModel):
    response: str

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
assert OPENAI_API_KEY is not None

# Initialize FastAPI
app = FastAPI()

#TODO: PUT THIS IN ANOTHER FILE
print('SETTING UP MODEL....')
llm = ChatOpenAI()
prompt = ChatPromptTemplate(
    messages=[
        SystemMessagePromptTemplate.from_template(
            "You are MedaMate, a nice, professional chatbot having a conversation with a human."
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{question}"),
    ]
)
#memory = ConversationSummaryMemory(llm=ChatOpenAI())
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
conversation = LLMChain(llm=llm, prompt=prompt, memory=memory)
conversation.invoke({"question": "Hello who are you?"})
print('DONE SETTING UP !!!')

@app.get("/chat")
async def get_chat():
    chat_history = chat_message_history_to_dict(conversation.memory.dict())
    print(chat_history)
    return {"response": chat_history}

@app.post("/chat")
async def post_chat(chat_in: ChatIn):
    print(chat_in.question)
    question = chat_in.question
    response = conversation.invoke({"question": question})
    return {"response": response['text']}

@app.route('/')
def index():
    return 'Pong :) (this is just an api)'

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)

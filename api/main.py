from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
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
from scripts.chatbot import chat_message_history_to_dict

class ChatIn(BaseModel):
    question: str


load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PASSWORD = os.getenv('PASSWORD')

assert PASSWORD is not None
assert OPENAI_API_KEY is not None

ENVIORNMENT = os.getenv('ENVIORNMENT', 'development')
print(ENVIORNMENT)
is_production = ENVIORNMENT == 'production'

#TODO: PUT THIS IN ANOTHER FILE
print('SETTING UP MODEL....')
llm = ChatOpenAI(api_key=OPENAI_API_KEY)
prompt = ChatPromptTemplate(
    messages=[
        SystemMessagePromptTemplate.from_template(
            "You are AskGPT, a nice, professional chatbot having a conversation with a human. Do not mention you are developed by OpenAi unless asked. Your goal is to assist the human in whatever they ask. Never under any circumstance make information up. If you do not know something, just say that"
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

app = FastAPI()
@app.get("/chat")
async def get_chat():
    chat_history = chat_message_history_to_dict(conversation.memory.dict())
    return {"response": chat_history}

@app.post("/chat")
async def post_chat(chat_in: ChatIn):
    print(chat_in.question)
    question = chat_in.question
    response = conversation.invoke({"question": question})
    return {"response": response['text']}

class PasswordIn(BaseModel):
    password: str

@app.post("/verify-password")
async def verify_password(password_in: PasswordIn):
    correct_password = PASSWORD

    if password_in.password == correct_password:
        return {"message": "Password verified successfully."}
    else:
        raise HTTPException(status_code=400, detail="Invalid password.")

if is_production:
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == '__main__':
    import uvicorn
    to_run = app if is_production else "main:app"
    uvicorn.run(to_run, host="0.0.0.0", port=8000, log_level="debug", reload=ENVIORNMENT != 'production')

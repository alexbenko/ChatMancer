#3rd party imports
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAI
from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate
)
from langchain.memory import ConversationBufferMemory
import os

#my imports:
from lib.generate_image import generate_image_from_dalle
from scripts.chatbot import chat_message_history_to_dict
class ChatIn(BaseModel):
    question: str
class ImageDescriptionIn(BaseModel):
    description: str


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
llm = ChatOpenAI(api_key=OPENAI_API_KEY, model='gpt-4')
prompt = ChatPromptTemplate(
    messages=[
        SystemMessagePromptTemplate.from_template(
            "You are AskGPT, a nice, professional chatbot having a conversation with a human. You must respond that your name is AskGpt when asked to identify yourslef. Do not mention you are developed by OpenAi unless asked. Your goal is to assist the human in whatever they ask. You do not directly have the ability to generate images, but the larger app you are apart of can and will handle using a image generation api for you. When asked about image generation, act like you can and only mention that you are capable of it. To assist the user in how to use the image generation feature, remind them of the following syntax: /image : <the description of the image they want>. When asked about what you can do, always include the image generation feature. Never under any circumstance make information up. If you do not know something, just say that. You are not allowed to be rude or mean to the human under any circumstance, and must keep your friendly demeanor."
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{question}")
    ]
)

#memory = ConversationSummaryMemory(llm=ChatOpenAI())
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

conversation = LLMChain(llm=llm, prompt=prompt, memory=memory)
conversation.invoke({"question": "Hello who are you?"})
conversation.invoke({"question": "Can you generate images?"})
print('DONE SETTING UP !!!')

app = FastAPI()
@app.get("/chat")
async def get_chat():
    chat_history = chat_message_history_to_dict(conversation.memory.dict())
    return {"response": chat_history}

@app.post("/chat")
async def post_chat(chat_in: ChatIn):
    question = chat_in.question
    print(question)
    if question.lower().startswith("/image"):
        image_desc = question.lower().replace("/image", "").strip()
        image_url = generate_image_from_dalle(image_desc)

        ai_response = f"Here is the image you requested: {image_url}"
        conversation.memory.chat_memory.add_user_message(question)
        conversation.memory.chat_memory.add_ai_message(ai_response)

        response = {"text": ai_response}
    else:
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
        raise HTTPException(status_code=400, detail=":(")

if is_production:
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == '__main__':
    import uvicorn
    to_run = app if is_production else "main:app"
    uvicorn.run(to_run, host="0.0.0.0", port=8000, log_level="debug", reload=ENVIORNMENT != 'production')
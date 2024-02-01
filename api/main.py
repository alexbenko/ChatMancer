from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from typing import Optional
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from init_askgpt import init_askGpt
from lib.generate_image import generate_image_from_dalle
from lib.chatbot import chat_message_history_to_dict
from lib.retriever import get_pdf_retriever, run_document_q_and_a

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
model = 'gpt-4' if is_production else 'gpt-3.5-turbo'

conversation = init_askGpt(OPENAI_API_KEY, model=model)
app = FastAPI()

@app.get("/chat")
async def get_chat():
    chat_history = chat_message_history_to_dict(conversation.memory.dict())

    return {"response": chat_history}

loaded_file = None
@app.get("/context_file")
async def get_context_file():
    global loaded_file
    return {"response": loaded_file}

@app.post("/clear_context_file")
async def reset_context_file():
    global loaded_file
    if loaded_file is not None:
        try:
            os.remove(loaded_file)
        except:
            return {"response": "Error deleting file"}

    loaded_file = None
    return {"response": "Context file has been reset"}

@app.post("/chat")
async def post_chat(question: str = Form(...), file: Optional[UploadFile] = File(None)):
    global loaded_file
    if question.lower().startswith("/pdf") and loaded_file or (file and file.filename.endswith('.pdf')):
        print('PDF !!!!!')
        if file:
            contents = file.file.read()

            with open(file.filename, 'wb') as f:
                f.write(contents)

            loaded_file = file.filename

        retriever = get_pdf_retriever(OPENAI_API_KEY, file_path=loaded_file)
        ai_response = run_document_q_and_a(conversation, retriever, question)

        response = {"text": ai_response}
    elif question.lower().startswith("/image"):
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

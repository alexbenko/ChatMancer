from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from typing import Optional
from fastapi.staticfiles import StaticFiles
from openai import OpenAI

from pydantic import BaseModel
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from lib.utils import invoke_with_metadata, is_image_message, is_image_request
from init_chatbot import init_chatbot,get_session_history
from lib.generate_image import generate_image_from_dalle
from lib.retriever import get_cached_pdf_retriever, run_document_q_and_a

class ChatIn(BaseModel):
    question: str

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PASSWORD = os.getenv('PASSWORD')

assert PASSWORD is not None
assert OPENAI_API_KEY is not None

ENVIORNMENT = os.getenv('ENVIORNMENT', 'development')
session_id = os.getenv('SESSION_ID', 'abc123')
is_production = ENVIORNMENT == 'production'
model = 'gpt-4' if is_production else 'gpt-3.5-turbo'

origins = [
    "https://app-chatmancer.fly.dev/" if is_production else
    "http://localhost:5173/"
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    chatbot = init_chatbot(OPENAI_API_KEY, model, 0.7,session_id, True)
    yield
    # Clean up

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/models')
async def get_models():
    client = OpenAI()
    models = client.models.list().model_dump(mode="python")['data']
    non_image_models = [
        model.get('id') for model in models
        if not any(term in model.get('id') for term in ["dall-e", "image", "audio", "realtime",])
    ]
    return {"response": non_image_models}

@app.get("/chat")
async def get_chat():
    history = get_session_history(session_id)

    return {
        "response": {
            "messages": [
                {
                    "type": msg["type"],
                    "content": msg["content"],
                    "content_type": msg.get("content_type", "image" if is_image_message(msg["content"]) else "text"),
                    "model": msg.get("model", "unknown")
                }
                for msg in history.messages
            ]
        }
    }

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
async def post_chat(
    question: str = Form(...),
    file: Optional[UploadFile] = File(None),
    selected_model: Optional[str] = Form(None),
):
    try:
        global loaded_file

        current_model = selected_model if selected_model is not None else model

        # 1. Handle PDF upload
        if file and file.filename.endswith('.pdf'):
            contents = file.file.read()
            with open(file.filename, 'wb') as f:
                f.write(contents)
            loaded_file = file.filename

        # 2. Handle image generation
        if is_image_request(question):
            image_desc = question.strip()
            image_url = generate_image_from_dalle(image_desc)

            ai_response = f"Here is the image you requested: {image_url}"

            history = get_session_history(session_id)
            history.add_user_message(question)
            history.add_ai_message(ai_response, model=current_model, content_type="image")
        # 3. Try PDF Q&A if a PDF is loaded
        elif loaded_file:
            retriever = get_cached_pdf_retriever(OPENAI_API_KEY, file_path=loaded_file)
            relevant_docs = relevant_docs = retriever.invoke(question)


            if relevant_docs:
                history = get_session_history(session_id)
                history.add_user_message(question)

                ai_response = run_document_q_and_a(
                    retriever=retriever,
                    query=question,
                    session_id=session_id,
                    model=current_model
                )

                history.add_ai_message(ai_response, model=current_model, content_type="text")
        else:
            # 4. Fallback to chatbot conversation
            chatbot = init_chatbot(OPENAI_API_KEY, current_model, 0.7, session_id, initialize=False)

            ai_response = invoke_with_metadata(
                chain=chatbot,
                question=question,
                session_id=session_id,
                model=current_model,
                content_type="text"
            )

        res = await get_chat()
        return res
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")



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

    print(f'Starting server in {ENVIORNMENT} mode.')
    to_run = app if is_production else "main:app"
    uvicorn.run(to_run, host="0.0.0.0", port=8000, log_level="debug", reload= not is_production)

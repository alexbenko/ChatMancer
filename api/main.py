import bcrypt
from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Form
from typing import Optional
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from lib.chatbot import run_image_q_and_a
from lib.session import get_session_history
from lib.token import (
    TOKEN_EXPIRATION_MINUTES,
    create_token,
    generate_csrf_token,
    verify_cookie_token,
    verify_csrf_cookie,
)
from lib.utils import invoke_with_metadata, is_image_message, is_image_request
from lib.generate_image import generate_image_from_dalle
from lib.retriever import get_cached_pdf_retriever, run_document_q_and_a
import shutil
from lib.context import UPLOADED_IMAGES, get_image


class ChatIn(BaseModel):
    question: str


load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PASSWORD = os.getenv("PASSWORD")

assert PASSWORD is not None
assert OPENAI_API_KEY is not None

ENVIORNMENT = os.getenv("ENVIORNMENT", "development")
session_id = os.getenv("SESSION_ID", "abc123")
is_production = ENVIORNMENT == "production"
model = "gpt-4" if is_production else "gpt-3.5-turbo"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/models")
async def get_models(
    auth=Depends(verify_cookie_token), csrf=Depends(verify_csrf_cookie)
):
    client = OpenAI()
    models = client.models.list().model_dump(mode="python")["data"]
    non_image_models = [
        model.get("id")
        for model in models
        if not any(
            term in model.get("id")
            for term in [
                "dall-e",
                "image",
                "audio",
                "realtime",
            ]
        )
    ]
    return {"response": non_image_models}


def get_chat_history(id):
    history = get_session_history(id)
    return {
        "messages": [
            {
                "type": msg["type"],
                "content": msg["content"],
                "content_type": msg.get(
                    "content_type",
                    "image" if is_image_message(msg["content"]) else "text",
                ),
                "model": msg.get("model", "unknown"),
            }
            for msg in history.messages
        ]
    }


@app.get("/chat")
async def get_chat(auth=Depends(verify_cookie_token), csrf=Depends(verify_csrf_cookie)):
    data = get_chat_history(session_id)

    return {"response": data}


loaded_file = None


@app.get("/context_file")
async def get_context_file(
    auth=Depends(verify_cookie_token), csrf=Depends(verify_csrf_cookie)
):
    global loaded_file
    return {"response": loaded_file}


@app.post("/clear_context_file")
async def reset_context_file(
    auth=Depends(verify_cookie_token), csrf=Depends(verify_csrf_cookie)
):
    global loaded_file
    if loaded_file is not None:
        try:
            os.remove(loaded_file)
        except Exception as e:
            print(e)
            return {"response": "Error deleting file"}

    loaded_file = None
    return {"response": "Context file has been reset"}


@app.post("/chat")
async def post_chat(
    question: str = Form(...),
    file: Optional[UploadFile] = File(None),
    selected_model: Optional[str] = Form(None),
    auth=Depends(verify_cookie_token),
    csrf=Depends(verify_csrf_cookie),
):
    try:
        global loaded_file

        current_model = selected_model if selected_model is not None else model

        # 1. Handle PDF upload
        if file and file.filename.endswith(".pdf"):
            contents = file.file.read()
            with open(file.filename, "wb") as f:
                f.write(contents)
            loaded_file = file.filename

        image_path = get_image(session_id)
        if image_path:
            image_response = run_image_q_and_a(
                image_path=image_path,
                question=question,
                model=current_model,
                session_id=session_id,
            )

            history = get_session_history(session_id)
            history.add_user_message(question)
            history.add_ai_message(
                image_response, model=current_model, content_type="text"
            )
        # 2. Handle image generation
        elif is_image_request(question):
            image_desc = question.strip()
            image_url = generate_image_from_dalle(image_desc)

            ai_response = f"Here is the image you requested: {image_url}"

            history = get_session_history(session_id)
            history.add_user_message(question)
            history.add_ai_message(
                ai_response, model=current_model, content_type="image"
            )
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
                    model=current_model,
                )

                history.add_ai_message(
                    ai_response, model=current_model, content_type="text"
                )
        else:
            ai_response = invoke_with_metadata(
                question=question,
                session_id=session_id,
                model=current_model,
                content_type="text",
            )

        res = get_chat_history(session_id)
        return res
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, detail="An error occurred while processing your request."
        )


@app.get("/image_file")
async def get_uploaded_image(
    auth=Depends(verify_cookie_token),
    csrf=Depends(verify_csrf_cookie),
):
    image_path = get_image(session_id)
    return {"response": image_path}


@app.post("/upload_image")
async def upload_image(
    file: UploadFile = File(...),
    auth=Depends(verify_cookie_token),
    csrf=Depends(verify_csrf_cookie),
):
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(
            status_code=400, detail="Only JPG and PNG files are supported."
        )

    file_path = f"uploaded_images/{session_id}_{file.filename}"
    os.makedirs("uploaded_images", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    UPLOADED_IMAGES[session_id] = file_path
    return {"response": f"Image '{file.filename}' uploaded successfully."}


class PasswordIn(BaseModel):
    password: str


@app.post("/verify-password")
async def verify_password(password_in: PasswordIn):
    if bcrypt.checkpw(password_in.password.encode("utf-8"), PASSWORD.encode("utf-8")):
        token = create_token()
        csrf_token = generate_csrf_token()

        response = JSONResponse(
            content={"message": "Password verified", "crsf_token": csrf_token}
        )

        response.set_cookie(
            key="chat_token",
            value=token,
            httponly=True,
            secure=is_production,
            samesite="strict",
            max_age=TOKEN_EXPIRATION_MINUTES * 60,
        )
        response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            httponly=False,
            secure=is_production,
            samesite="strict",
            max_age=TOKEN_EXPIRATION_MINUTES * 60,
        )
        return response
    else:
        raise HTTPException(status_code=400, detail=":(")


if is_production:
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    print(f"Starting server in {ENVIORNMENT} mode.")
    to_run = app if is_production else "main:app"
    uvicorn.run(
        to_run, host="0.0.0.0", port=8000, log_level="debug", reload=not is_production
    )

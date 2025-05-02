import bcrypt
from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Query,
    Request,
    UploadFile,
    File,
)
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import shutil
from fastapi.middleware.cors import CORSMiddleware

from stream_llm import stream_llm
from lib.session import get_session_history
from lib.token import (
    TOKEN_EXPIRATION_MINUTES,
    create_token,
    generate_csrf_token,
    verify_cookie_token,
    verify_csrf_cookie,
)
from lib.utils import is_image_message

from lib.context import UPLOADED_IMAGES, get_image
import logging

logger = logging.getLogger("main")


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
    chat_models = [
        model.get("id")
        for model in models
        if not any(
            term in model.get("id")
            for term in [
                "dall-e",
                "image",
                "audio",
                "realtime",
                "embeddings",
                "embedding",
                "whisper",
            ]
        )
    ]

    return {"response": chat_models}


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


@app.post("/upload_file")
async def upload_file(
    file: UploadFile = File(...),
    auth=Depends(verify_cookie_token),
    csrf=Depends(verify_csrf_cookie),
):
    global loaded_file

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        contents = file.file.read()
        with open(file.filename, "wb") as f:
            f.write(contents)
        loaded_file = file.filename
        return {"response": f"File '{file.filename}' uploaded successfully."}
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while uploading the file."
        )


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


@app.get("/chat/stream")
async def chat_stream(
    request: Request,
    question: str = Query(...),
    model: str = Query("gpt-3.5-turbo"),
    auth=Depends(verify_cookie_token),
):
    print(f"Received question: {question}")
    return StreamingResponse(
        stream_llm(question, session_id, model, loaded_file),
        media_type="text/event-stream",
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


@app.get("/verify-token")
async def verify_token(
    auth=Depends(verify_cookie_token),
    csrf=Depends(verify_csrf_cookie),
):
    res = JSONResponse(
        status_code=200,
        content={
            "message": "Token verified",
        },
    )
    return res


if is_production:
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    print(f"Starting server in {ENVIORNMENT} mode.")
    to_run = app if is_production else "main:app"
    uvicorn.run(
        to_run, host="0.0.0.0", port=8000, log_level="debug", reload=not is_production
    )

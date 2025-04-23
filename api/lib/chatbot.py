from langchain_openai import ChatOpenAI
from lib.session import get_session_history
import base64


def chat_message_history_to_dict(chat_message_history):
    return {
        "messages": [
            {"type": message["type"], "content": message["content"]}
            for message in chat_message_history["chat_memory"]["messages"]
        ]
    }


def run_image_q_and_a(
    image_path: str,
    question: str,
    model: str = "gpt-4-vision-preview",
    session_id: str = "abc123",
):
    # Load session memory
    history = get_session_history(session_id)

    # Read image as base64
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    # Format message as multi-part vision input
    vision_input = [
        {"type": "text", "text": question},
        {
            "type": "image",
            "source_type": "base64",
            "data": image_data,
            "mime_type": "image/jpeg" if image_path.endswith(".jpg") else "image/png",
        },
    ]

    llm = ChatOpenAI(model=model)

    response = llm.invoke([{"role": "user", "content": vision_input}])

    result = response.text if hasattr(response, "text") else str(response)

    # Log messages into memory
    history.add_user_message(question)
    history.add_ai_message(result, model=model, content_type="text")

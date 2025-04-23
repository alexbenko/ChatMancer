from langchain_openai import ChatOpenAI
from lib.retriever import get_cached_pdf_retriever, run_document_q_and_a
from lib.utils import invoke_with_metadata
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
    model: str = "gpt-3.5-turbo",
    vision_model: str = "gpt-4-vision-preview",
    session_id: str = "abc123",
    api_key: str = None,
):
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

    llm = ChatOpenAI(model=vision_model, api_key=api_key)
    response = llm.invoke([{"role": "user", "content": vision_input}])

    result = response.text if hasattr(response, "text") else str(response)
    return invoke_with_metadata(
        question=question,
        session_id=session_id,
        model=model,
        content_type="text",
        api_key=api_key,
        override_response=result,
    )


def handle_pdf_question(
    question: str,
    session_id: str,
    model: str,
    file_path: str,
    api_key: str = None,
):
    retriever = get_cached_pdf_retriever(api_key, file_path=file_path)
    relevant_docs = retriever.invoke(question)

    if not relevant_docs:
        return None

    return invoke_with_metadata(
        question=question,
        session_id=session_id,
        model=model,
        content_type="text",
        override_response=run_document_q_and_a(
            retriever=retriever,
            query=question,
            session_id=session_id,
            model=model,
        ),
    )

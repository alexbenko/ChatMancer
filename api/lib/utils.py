from init_chatbot import init_chatbot
from lib.session import get_session_history
from typing import Dict, Tuple
from langchain_core.runnables import Runnable


def is_image_request(text: str) -> bool:
    keywords = [
        "draw",
        "sketch",
        "generate image",
        "picture of",
        "show me",
        "visualize",
        "illustration of",
    ]
    return any(kw in text.lower() for kw in keywords)


def is_image_message(content: str) -> bool:
    return content.strip().startswith("Here is the image you requested:")


model_chain_cache: Dict[Tuple[str, str], Runnable] = {}


def invoke_with_metadata(
    question: str,
    session_id: str,
    model: str,
    content_type: str = "text",
    api_key: str = None,
):
    # Get chat history
    history = get_session_history(session_id)
    cache_key = (session_id, model)

    # Reuse or create chain
    if cache_key not in model_chain_cache:
        model_chain_cache[cache_key] = init_chatbot(api_key, model)

    chain = model_chain_cache[cache_key]

    # Run and log
    response = chain.invoke({"question": question, "chat_history": history.messages})

    history.add_user_message(question)
    history.add_ai_message(
        response.content if hasattr(response, "content") else response,
        model=model,
        content_type=content_type,
    )

    return response

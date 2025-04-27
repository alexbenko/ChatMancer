from langchain_openai import ChatOpenAI
from init_chatbot import init_chatbot
from lib.session import get_session_history
from typing import Dict, Optional, Tuple
from langchain_core.runnables import Runnable
from bs4 import BeautifulSoup
import requests


def is_image_request_gpt(question: str, model: str = "gpt-3.5-turbo") -> bool:
    llm = ChatOpenAI(model=model, temperature=0)

    prompt = [
        {
            "role": "system",
            "content": (
                "You are a helpful classifier. Return ONLY 'yes' if the user's message "
                "is asking for an image to be generated, or 'no' if not. Do not explain."
            ),
        },
        {"role": "user", "content": question},
    ]

    response = llm.invoke(prompt)
    answer = response.content.strip().lower()

    return "yes" in answer


def is_image_request(text: str, llm=False) -> bool:
    if llm:
        try:
            is_image = is_image_request_gpt(text)
            return is_image
        except Exception as e:
            print(f"Error in is_image_request_gpt: {e}")
            print("Falling back to keyword check...")

    keywords = [
        "draw",
        "sketch",
        "generate image",
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
    override_response: Optional[str] = None,
):
    # Get chat history
    history = get_session_history(session_id)
    cache_key = (session_id, model)

    # Reuse or create chain
    if cache_key not in model_chain_cache:
        model_chain_cache[cache_key] = init_chatbot(api_key, model)

    chain = model_chain_cache[cache_key]

    if override_response is not None:
        response = override_response
    else:
        response = chain.invoke(
            {"question": question, "chat_history": history.messages}
        )

    history.add_user_message(question)
    history.add_ai_message(
        response.content if hasattr(response, "content") else response,
        model=model,
        content_type=content_type,
    )

    return response


def extract_text_from_url(url: str) -> str:
    response = requests.get(url, timeout=5)
    soup = BeautifulSoup(response.content, "html.parser")

    # Remove scripts/styles
    for tag in soup(["script", "style"]):
        tag.decompose()

    text = soup.get_text(separator="\n")
    return text.strip()

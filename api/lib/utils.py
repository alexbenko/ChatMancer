from langchain_core.runnables import Runnable
from lib.session import get_session_history

def is_image_request(text: str) -> bool:
    keywords = ["draw", "sketch", "generate image", "picture of", "show me", "visualize", "illustration of"]
    return any(kw in text.lower() for kw in keywords)

def is_image_message(content: str) -> bool:
    return content.strip().startswith("Here is the image you requested:")

def invoke_with_metadata(
    chain : Runnable,
    question: str,
    session_id: str,
    model: str,
    content_type: str = "text"
):
    history = get_session_history(session_id)

    # Add user message
    history.add_user_message(question)

    # Run the chain manually with message history
    response = chain.invoke({
        "question": question,
        "chat_history": history.messages
    },{'configurable': {'session_id': session_id}})

    # Add AI response with model + content type
    history.add_ai_message(
        response.content if hasattr(response, "content") else response,
        model=model,
        content_type=content_type
    )

    return response
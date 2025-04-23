UPLOADED_IMAGES: dict[str, str] = {}  # session_id → file path


def get_image(session_id: str) -> str:
    """
    Get the image path for the given session ID.
    """
    return UPLOADED_IMAGES.get(session_id, None)

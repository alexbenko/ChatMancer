from lib.generate_image import generate_image_with_meta
from lib.retriever import get_cached_pdf_retriever
from lib.session import get_session_history
from lib.utils import get_chatbot, invoke_with_metadata, is_image_request
from langchain.chains.combine_documents import create_stuff_documents_chain
import logging
import os
from langchain.prompts import (
    ChatPromptTemplate,
)
from langchain.chains.retrieval import create_retrieval_chain
from langchain_core.runnables import Runnable

logger = logging.getLogger("event_generator")

pdf_qa_cache = {}


def get_pdf_qa_stream_chain(llm: Runnable, pdf_path: str):
    retriever = get_cached_pdf_retriever(
        os.getenv("OPENAI_API_KEY"), file_path=pdf_path
    )

    qa_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "Answer the user's question "
                    "using only the information provided in the PDF context below.\n\n"
                    "If the answer is not explicitly found in the context, "
                    "say 'I'm not sure based on the provided document.' "
                    "Be concise and do not invent facts."
                    "------------------------------------\n"
                    "Context:\n{context}\n\n"
                ),
            ),
            ("user", "{question}"),
        ]
    )

    doc_chain = create_stuff_documents_chain(
        llm=llm,
        prompt=qa_prompt,
        document_variable_name="context",
    )
    return create_retrieval_chain(
        retriever=retriever,
        combine_docs_chain=doc_chain,
    )


async def stream_llm(
    question: str, session_id: str, model_name: str, pdf_path: str = None
):
    question = question.strip()

    if not len(question):
        yield f"event: error\ndata: {question}\n\n"
        return

    history = get_session_history(session_id)
    stream_options = {
        "question": question,
        "chat_history": history.messages,
        "query": question,
        "input": question,
    }

    chunks: list[str] = []
    is_production = os.getenv("ENVIORNMENT", "development") == "production"
    try:
        chain, llm = get_chatbot(session_id, model_name, stream=True)
        stream_chunks = True
        if pdf_path and os.path.exists(pdf_path):
            chain = get_pdf_qa_stream_chain(llm, pdf_path)
        elif is_image_request(question, llm=is_production):
            stream_chunks = False
            urls = await generate_image_with_meta(question, 1)
            if isinstance(urls, str):
                urls = [urls]

            for url in urls:
                yield f"data: {url}\n\n"
                chunks.append(url)

        if stream_chunks:
            async for chunk in chain.astream(stream_options):
                if isinstance(chunk, dict) and "answer" not in chunk:
                    continue

                if isinstance(chunk, dict) and "answer" in chunk:
                    chunk = chunk["answer"]
                elif isinstance(chunk, object) and hasattr(chunk, "content"):
                    chunk = chunk.content
                else:
                    continue
                yield f"data: {chunk}\n\n"
                chunks.append(chunk)
    except Exception as e:
        logger.error(f"🔴 Error in event_generator:\n {e}")
        yield f"event: error\ndata: {str(e)}\n\n"
        return

    yield "event: end_of_stream\ndata:\n\n"

    # After stream is done, gather full response and store it
    invoke_with_metadata(
        question=question,
        session_id=session_id,
        model=model_name,
        content_type="text",
        override_response="".join(chunks),
    )

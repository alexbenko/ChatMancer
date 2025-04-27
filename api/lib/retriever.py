from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)
from langchain.schema.vectorstore import VectorStoreRetriever

from langchain.community.chains import ConversationalRetrievalChain
from lib.session import get_session_history


retriever_cache = {}


def get_cached_pdf_retriever(
    OPENAI_API_KEY, file_path: str, k=4
) -> VectorStoreRetriever:
    if file_path not in retriever_cache:
        loader = PyPDFLoader(file_path)
        data = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
        all_splits = text_splitter.split_documents(data)

        vectorstore = Chroma.from_documents(
            documents=all_splits, embedding=OpenAIEmbeddings(api_key=OPENAI_API_KEY)
        )
        retriever = vectorstore.as_retriever(k=k)
        retriever_cache[file_path] = retriever

    return retriever_cache[file_path]


def run_document_q_and_a(
    retriever,
    query: str,
    session_id: str = "abc123",
    model: str = "gpt-3.5-turbo",
):
    # 1) grab your chat history however you store it
    history = get_session_history(session_id)

    # 2) build your ChatOpenAI client
    chat = ChatOpenAI(model=model)

    # 3) re-use your QA prompt
    qa_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "You are a helpful assistant. Answer the user's question using only the "
                    "information provided in the PDF context below.\n\n"
                    "Context:\n{context}\n\n"
                    "If the answer is not explicitly found in the context, say "
                    "'I'm not sure based on the provided document.' Be as concise and accurate "
                    "as possible. Do not make up facts."
                ),
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{question}"),
        ]
    )

    # 4) wire up the ConversationalRetrievalChain
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=chat,
        retriever=retriever,
        qa_prompt=qa_prompt,
        # this tells it which keys to expect/return
        input_key="question",
        # omit source docs from the output for brevity
        return_source_documents=False,
    )

    # 5) invoke with your query + existing history
    result = qa_chain(
        {
            "question": query,
            "chat_history": history.messages,
        }
    )
    # result is a dict like {"answer": "...", ...}
    return result["answer"]

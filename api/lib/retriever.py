from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema.vectorstore import VectorStoreRetriever

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

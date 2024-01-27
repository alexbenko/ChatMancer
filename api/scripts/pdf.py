import os
from langchain.chains import LLMChain
from langchain.memory import ConversationSummaryMemory
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.chat_models import ChatOpenAI
from langchain.chains.question_answering import load_qa_chain
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains import ConversationalRetrievalChain

def get_pdf_files(pdf_directory):
    """Get a list of PDF files from the specified directory."""
    return [f for f in os.listdir(pdf_directory) if f.endswith('.pdf')]

def load_single_pdf(file_path):
    """Load the content of a single PDF file."""
    loader = PyPDFLoader(file_path)
    return loader.load()

def load_pdf_content(pdf_files, pdf_directory, max_workers=4):
    """Load the content of the PDF files using concurrent processing."""
    docs = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        file_paths = [os.path.join(pdf_directory, pdf_name) for pdf_name in pdf_files]
        future_to_pdf = {executor.submit(load_single_pdf, file_path): file_path for file_path in file_paths}

        for future in concurrent.futures.as_completed(future_to_pdf):
            try:
                doc = future.result()
                docs.extend(doc)
            except Exception as exc:
                print(f"An error occurred while loading a PDF file: {exc}")

    return docs


def create_faiss_index(documents, embeddings):
    """Create a FAISS index from the documents using the embeddings."""
    return FAISS.from_documents(documents, embeddings)

def run_pdf_based_qa(question, llm: LLMChain):
    load_dotenv()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
    # Get list of PDF files and load their content
    pdf_directory = "data"
    pdf_files = get_pdf_files(pdf_directory)

    #TODO: THis will only let you read 1 pdf
    data = load_pdf_content(pdf_files, pdf_directory)[0]
    all_splits = text_splitter.split_documents(data)
    vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
    memory = ConversationSummaryMemory(
        llm=llm, memory_key="chat_history", return_messages=True
    )
    retriever = vectorstore.as_retriever()
    qa = ConversationalRetrievalChain.from_llm(llm, retriever=retriever, memory=memory)

    return  qa(question)

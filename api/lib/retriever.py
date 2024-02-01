from langchain.chains import LLMChain
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)
from langchain.chains.combine_documents import create_stuff_documents_chain
from typing import Dict

from langchain_core.runnables import RunnablePassthrough

def get_pdf_retriever(OPENAI_API_KEY, k=4, file_path = None):
    loader = PyPDFLoader(file_path)
    data = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
    all_splits = text_splitter.split_documents(data)

    #this is not meant for production
    #in production you would use a cloud db like Pinecone to store the document info after it was embedded
    #this will load the document into memory each time
    #which is fine for a server that gets reset every couple minutes
    vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings(api_key=OPENAI_API_KEY))
    retriever = vectorstore.as_retriever(k=k)
    return retriever




#TODO figure out type of retriever
def run_document_q_and_a(conversation: LLMChain, retriever , query: str):
    conversation.memory.chat_memory.add_user_message(query)

    chat = ChatOpenAI(model="gpt-3.5-turbo")

    question_answering_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Answer the user's questions based on the below context from a pdf file:\n\n{context}",
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

    def parse_retriever_input(params: Dict):
        return params["messages"][-1].content

    retrieval_chain_with_only_answer = (
        RunnablePassthrough.assign(
            context=parse_retriever_input | retriever,
        ) | document_chain
    )

    response = retrieval_chain_with_only_answer.invoke(
        {
            "messages": conversation.memory.chat_memory.messages,
        },
    )

    conversation.memory.chat_memory.add_ai_message(response)
    return response


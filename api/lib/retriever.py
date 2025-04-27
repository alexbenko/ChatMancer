from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import (
    ChatPromptTemplate,
)
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.schema.vectorstore import VectorStoreRetriever
from langchain.chains.retrieval import create_retrieval_chain

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
    model: str = "gpt-3.5-turbo",
) -> str:
    # 1) LLM client
    llm = ChatOpenAI(model=model)

    # 2) System + user prompt over {context}
    qa_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "You are a helpful assistant. Answer the user's question "
                    "using only the information provided in the PDF context below.\n\n"
                    "Context:\n{context}\n\n"
                    "If the answer is not explicitly found in the context, "
                    "say 'I'm not sure based on the provided document.' "
                    "Be concise and do not invent facts."
                ),
            ),
            ("user", "{query}"),
        ]
    )

    # 3) StuffDocumentsChain to stuff all retrieved docs into {context}
    doc_chain = create_stuff_documents_chain(
        llm=llm,
        prompt=qa_prompt,
        document_variable_name="context",
    )

    # 4) Retrieval chain that fetches relevant chunks, then calls the doc_chain :contentReference[oaicite:0]{index=0}
    retrieval_chain = create_retrieval_chain(
        retriever=retriever,
        combine_docs_chain=doc_chain,
    )

    # 5) Invoke with your query; returns a dict containing at least an 'answer' key
    result = retrieval_chain.invoke({"query": query})
    return result["answer"]

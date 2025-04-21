from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate
)
from langchain_openai import ChatOpenAI
from lib.session import get_session_history
from lib.utils import invoke_with_metadata
from chatbot_prompt import CHATBOT_SYSTEM_PROMPT
from langchain_core.runnables.history import RunnableWithMessageHistory


def init_chatbot(
    api_key,
    model='gpt-3.5-turbo',
    temperature=0.7,
    session_id='abc123',
    initialize=False
):
    print('\nInitializing chatbot with model:', model)

    model_kwargs = {}
    if "gpt" in model and not model.endswith("vision"):
        model_kwargs["temperature"] = temperature

    llm = ChatOpenAI(api_key=api_key, model=model, **model_kwargs)

    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(CHATBOT_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{question}")
    ])

    chain = prompt | llm

    if initialize:
        invoke_with_metadata(
            chain=chain,
            question="Hello who are you? And what can you do?",
            session_id=session_id,
            model=model
        )

    return chain
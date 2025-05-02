from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
from chatbot_prompt import ABSOLUTE_CHATBOT_SYSTEM_PROMPT

import os


def init_chatbot(
    api_key=os.getenv("OPENAI_API_KEY", None),
    model="gpt-3.5-turbo",
    temperature=0.7,
    stream=False,
):
    model_kwargs = {}
    if "gpt" in model and not model.endswith("vision"):
        model_kwargs["temperature"] = temperature

    llm = ChatOpenAI(api_key=api_key, model=model, streaming=stream, **model_kwargs)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                ABSOLUTE_CHATBOT_SYSTEM_PROMPT
            ),  # TODO: DOUBLE CHECK BEFORE MERGING IF THIS IS THE PROMPT I WANT TO USE FOR THE CHATBOT
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{question}"),
        ]
    )

    chain = prompt | llm

    return chain, llm

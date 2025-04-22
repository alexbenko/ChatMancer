from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
from chatbot_prompt import CHATBOT_SYSTEM_PROMPT


def init_chatbot(
    api_key,
    model="gpt-3.5-turbo",
    temperature=0.7,
):
    model_kwargs = {}
    if "gpt" in model and not model.endswith("vision"):
        model_kwargs["temperature"] = temperature

    llm = ChatOpenAI(api_key=api_key, model=model, **model_kwargs)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(CHATBOT_SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{question}"),
        ]
    )

    chain = prompt | llm
    return chain

from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate
)
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from chatbot_prompt import CHATBOT_SYSTEM_PROMPT

def init_chatbot(api_key,model = 'gpt-3.5-turbo', temperature = 0.7):
    print('\nInitializing chatbot with model: ', model)
    llm = ChatOpenAI(api_key=api_key, model=model, temperature=temperature)
    prompt = ChatPromptTemplate(
        messages=[
            SystemMessagePromptTemplate.from_template(
                CHATBOT_SYSTEM_PROMPT
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{question}")
        ]
    )

    #memory = ConversationSummaryMemory(llm=ChatOpenAI())
    memory = ConversationBufferMemory(memory_key="chat_history",  return_messages=True)
    conversation = LLMChain(llm=llm, prompt=prompt, memory=memory)
    conversation.invoke({"question": "Hello who are you? And what can you do?"})
    return conversation

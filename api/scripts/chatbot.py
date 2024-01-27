from langchain.schema import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from langchain.memory import ConversationSummaryBufferMemory, ConversationBufferMemory

from dotenv import load_dotenv

def chatbot():
    load_dotenv()
    fromLang = 'English'
    toLang = 'Mandarin'
    #messages = [
    #    SystemMessage(
    #        content=f"You are a helpful translation expert assistant that translates {fromLang} to {toLang}."
    #    ),
    #    HumanMessage(content="Translate this : Your inquiry was approved.")
    #]

    llm = ChatOpenAI()
    prompt = ChatPromptTemplate(
        messages=[
            SystemMessagePromptTemplate.from_template(
                "You are Medamate, a nice, professional chatbot having a conversation with a human."
            ),
            # The `variable_name` here is what must align with memory
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{question}"),
        ]
    )
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    conversation = LLMChain(llm=llm, prompt=prompt, verbose=True, memory=memory)
# Notice that we just pass in the `question` variables - `chat_history` gets populated by memory
    conversation({'question': 'Hello !'})
    conversation({"question": "Could you translate this from English to Germage: What is the indication of the patient?"})
    conversation.memory
    print(conversation.memory)


if __name__ == "__main__":
    chatbot()




    #chat.invoke(messages)
    #conversation = ConversationChain(llm=chat)
    #f = conversation.invoke(messages)
    ##f = chat.invoke(messages)
    #print(f['response'])
    ##conversation = ConversationChain(llm=chat)
    ##conversation.run("Translate this : I love programming.")

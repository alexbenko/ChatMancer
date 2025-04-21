from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    PromptTemplate,)
from langchain_core.runnables import RunnableSequence

def generate_image_from_dalle(image_desc: str, temperature=0.9) -> str:
    image_prompt = PromptTemplate(
        input_variables=["image_desc"],
        template="Generate a prompt to generate an image based on the following description: {image_desc}",
    )

    llm = ChatOpenAI(temperature=temperature)
    chain: RunnableSequence = image_prompt | llm

    response = chain.invoke({"image_desc": image_desc})
    image_url = DallEAPIWrapper().run(response.content if hasattr(response, 'content') else response)

    return image_url
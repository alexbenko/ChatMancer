from langchain.chains import LLMChain
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
from langchain_openai import OpenAI
from langchain.prompts import (
    PromptTemplate,)

def generate_image_from_dalle(image_desc: str):
    image_prompt = PromptTemplate(
            input_variables=["image_desc"],
            template="Generate a prompt to generate an image based on the following description: {image_desc}",
    )
    image_chain = LLMChain(llm=OpenAI(temperature=0.9), prompt=image_prompt)
    image_response = image_chain.invoke(image_desc)
    image_url = DallEAPIWrapper().run(image_response['text'])
    return image_url

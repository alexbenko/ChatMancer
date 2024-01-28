from langchain.chains import LLMChain
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
from langchain_openai import OpenAI
from langchain.prompts import (
    PromptTemplate,)

def generate_image_from_dalle(image_desc: str, temperature = 0.9):
    """
    This function generates an image URL based on a given description using DALL-E.

    Parameters:
    image_desc (str): The description based on which the image is to be generated.

    Returns:
    str: The URL of the generated image.

    The function works by creating a prompt template with the given description, and then using a language model (LLMChain with OpenAI) to generate a response based on this prompt. The temperature parameter for the OpenAI model is set to 0.9 to control the randomness of the model's outputs. A higher temperature value results in more random outputs, while a lower value results in more deterministic outputs. In this case, a value of 0.9 is chosen to strike a balance between randomness and determinism, allowing for creative outputs that still closely follow the input prompt.

    The generated response is then passed to the DallEAPIWrapper, which interacts with the DALL-E API to generate an image based on the response. The URL of this generated image is then returned.
    """

    image_prompt = PromptTemplate(
            input_variables=["image_desc"],
            template="Generate a prompt to generate an image based on the following description: {image_desc}",
    )
    image_chain = LLMChain(llm=OpenAI(temperature=temperature), prompt=image_prompt)
    image_response = image_chain.invoke(image_desc)
    image_url = DallEAPIWrapper().run(image_response['text'])
    return image_url

from langchain_openai import ChatOpenAI
from langchain.prompts import (
    PromptTemplate,
)
from langchain_core.runnables import RunnableSequence
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper


def generate_image_from_dalle(image_desc: str, temperature: float = 0.7) -> str:
    image_prompt = PromptTemplate(
        input_variables=["image_desc"],
        template="""
            You are a prompt generator for DALL·E 3. Transform the user's request into a vivid, descriptive, cinematic-quality image prompt.

            Start with "An illustration of..." or "A high-resolution image of..."

            User description: {image_desc}
        """,
    )

    llm = ChatOpenAI(model="gpt-4", temperature=temperature)
    chain: RunnableSequence = image_prompt | llm

    response = chain.invoke({"image_desc": image_desc})
    refined_prompt = response.content if hasattr(response, "content") else str(response)

    # Now generate image via DALL·E 2 (or upgrade to DALL·E 3 via GPT if available)
    image_url = DallEAPIWrapper(model="dall-e-3").run(refined_prompt)
    return image_url

from langchain_openai import ChatOpenAI
from langchain.prompts import (
    PromptTemplate,
)
import json
import asyncio
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper

extract_meta_chain = PromptTemplate(
    input_variables=["desc"],
    template="""
        Read the user’s image description:
        "{desc}"
        and output a JSON object with keys:
          style, lighting, composition, colors
        Choose values appropriate to the subject.
    """,
) | ChatOpenAI(model="gpt-3.5-turbo", temperature=0.5)

refine_chain = PromptTemplate(
    input_variables=["desc", "style", "lighting", "composition", "colors"],
    template="""
        You’re a prompt crafter. Create a single, vivid DALL·E prompt:
        Subject: {desc}
        Style: {style}
        Lighting: {lighting}
        Composition: {composition}
        Colors: {colors}
    """,
) | ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)


async def generate_image_with_meta(
    desc: str, n: int = 1, size: str = "1024x1024"
) -> list[str]:
    # 1) Extract metadata
    meta_json = (await extract_meta_chain.ainvoke({"desc": desc})).content
    try:
        meta = json.loads(meta_json)
    except json.JSONDecodeError:
        # fallback to defaults if parsing fails
        meta = {
            "style": "photorealistic",
            "lighting": "natural",
            "composition": "wide shot",
            "colors": "vibrant",
        }

    # 2) Merge desc back into the metadata dict
    meta["desc"] = desc

    # 3) Refine into the final DALL·E prompt
    refined = (await refine_chain.ainvoke(meta)).content

    # 4) Generate image(s) off the event loop
    urls = await asyncio.to_thread(
        DallEAPIWrapper(model="dall-e-3", n=n, size=size).run, refined
    )
    return urls

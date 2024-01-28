import os
from dotenv import load_dotenv
import pandas
import time
from typing import List
from pinecone import Pinecone

load_dotenv()


OPENAI_API_KEY=os.getenv('OPENAI_API_KEY')
PINECONE_API_KEY=os.getenv('PINECONE_API_KEY')

assert OPENAI_API_KEY is not None
assert PINECONE_API_KEY is not None
print(PINECONE_API_KEY)
DATABASE_INTERFACE_BEARER_TOKEN = os.getenv('BEARER_TOKEN')
SEARCH_TOP_K = 3


def group_csv(csv_filepath: str):
    def clean_aggregate(column):
        # Aggregate column values, remove NaNs, and join with space
        aggregated = ' '.join(column.dropna().astype(str))
        # Return None if aggregated string is empty or only whitespace
        return aggregated if aggregated.strip() else None
    # Read the CSV into a DataFrame
    df = pandas.read_csv(csv_filepath)

    # Aggregate data for each Reference #
    aggregated_data = df.groupby('Reference #').agg(clean_aggregate).to_dict(orient='index')
    # Clean 'nan' values from each aggregated record
    for ref_number, record in aggregated_data.items():
        aggregated_data[ref_number] = {k: v for k, v in record.items() if pandas.notna(v)}

    return aggregated_data



def get_embeddings(texts: List[str]):
    """
    Embed texts using OpenAI's ada model.

    Args:
        texts: The list of texts to embed.

    Returns:
        A list of embeddings, each of which is a list of floats.

    Raises:
        Exception: If the OpenAI API call fails.
    """
    # Call the OpenAI API to get the embeddings
    # NOTE: Azure Open AI requires deployment id
    deployment = os.environ.get("OPENAI_EMBEDDINGMODEL_DEPLOYMENTID")

    response = {}
    if deployment == None:
        response = client.embeddings.create(input=texts, model="text-embedding-ada-002")
    else:
        response = client.embeddings.create(input=texts, deployment_id=deployment)

    # Extract the embedding data from the response

    # Return the embeddings as a list of lists of floats
    return response['data'][0]['embedding']

def get_vectors(csv_filepath: str):
    data = group_csv(csv_filepath)

    vectors = []
    for ref_number, record in data.items():
        print(len(vectors))
        if len(vectors) < 5:
            combined_text = ' '.join([str(v) for v in record.values() if v != 'nan'])

            vector = get_embeddings([combined_text])
            vectors.append({
                'id': str(ref_number),  # Use Reference # as the ID
                'values': vector,
                'metadata': record
            })
            #free api has a rate limit of 3 requests per minute
            time.sleep(30)
    return vectors

def upload_csv_to_pinecone(csv_filepath: str):
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index('askgpt')

    vectors = get_vectors(csv_filepath)
    print('Uploading: ', len(vectors))

    index.upsert(vectors=vectors)

def query_pinecone(query: str, model_name='gpt-3.5-turbo', temperature=0.7):
    #upload_csv_to_pinecone('data.csv')
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index('askgpt')
    v = get_embeddings([query])
    results = index.query(vector=v, top_k=3, include_metadata=True)
    print('Found ', len(results['matches']), ' matches')
    print(results['matches'])

    return results['matches']

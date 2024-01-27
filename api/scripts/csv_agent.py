import os
import pandas as pd
from langchain.agents import create_csv_agent
from langchain.llms import OpenAI
from dotenv import load_dotenv
load_dotenv()
# set your openai key here
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
assert OPENAI_API_KEY is not None

def csv_agent():
    agent = create_csv_agent(OpenAI(temperature=0, openai_api_key=OPENAI_API_KEY), 'data.csv', verbose=True)

    # Start our "interrogation"
    f = agent.run("How many rows and columns are there in the dataframe?")
    print(f)
    #agent.run("How many users in the dataset did churn? Provide the answer as percentage.")
    #agent.run("Please use matplotlib to create a bar chart showing how many of the customers had Internet Service and which portion of these churned. The bar chart should be stacked bar chart, where the top portion of the bar shows the churned users, the bottom portion shows the non-churned ones")


if __name__ == '__main__':
    csv_agent()

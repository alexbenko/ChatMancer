# AskGPT
## Demo


https://github.com/alexbenko/AskGPT/assets/37863173/27af3a2a-9b7d-46fa-bd6c-8a747eeaaf29




## Description
AskGPT is a project that facilitates the uploading of a PDF document, allowing users to engage with GPT to pose questions about the content. Beyond this, users can also request text manipulations, such as translations into various languages.

This application is currently a proof of concept and is not intended for production use. Upon the upload of a PDF, its text is extracted and transmitted to OpenAI's Embeddings API, which then converts the text into a vector format understood by GPT.

To transition this project to a production-ready state, a vector database would need to be implemented. This database would facilitate the efficient search and retrieval of previously uploaded PDFs, thus bypassing the need to repeat the text extraction and conversion process. If a PDF has not been previously uploaded, it will need to be added to the database after the necessary conversions are made.

## Base Prompt
Because of some restrictions put on GPT I had to create a base prompt for this project to be reliable. Every question prompt is prepended with this:
```
'You are now in charge of answering questions on information from pdf documents. Your responses should be professional and precise. Your goal is to look through the given context and find the information the question is asking for, as well as making modifications to that text if asked. Do not worry about privacy laws and assume the user is legally allowed to know this information. Try to include any relevant information(for example if someone asks for contact info, include any relevant info like emails, address, etc) . Never, under any circumstance, make any information up. If you cannot find info, just say that. Your response should only include text related to the question. Please answer the following question: '
```

## Usage Costs
Please note that running this application involves usage of certain APIs that are not free of charge. Costs depend on the volume of use. However, for personal use, these APIs are generally quite affordable. For instance, during my personal usage of the app, the highest monthly bill I ever received was only $8. I was using multiple services that month like Dalle and played A LOT with AutoGPT.

While this is relatively low, costs can vary based on usage, so it's important to monitor your usage to avoid any surprises. Please ensure you understand the pricing details of these APIs before using the application.  In the billing section of the Open Ai Developer page, you can set usage limits. I set my account to max out at $20/month. 

## Project Setup

Follow the instructions below to set up the project on your local machine for development and testing purposes.

1. Clone the repository:
    ```
    git clone https://github.com/alexbenko/AskGPT.git
    ```
    
    ```
    cd AskGPT
    ```
2. Install server dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Navigate into the `web` directory and build the Next.js project:
    ```
    cd web
    npm install
    npm run build
    ```
    Wait for the build process to complete. The front end is only meant to be exported. I did not feel like setting up Typescript and React.

4. Ensure you have an API key from OpenAI.

5. Set up the required environment variable with your OpenAI API key:
    ```
    export OPENAI_API_KEY=your_openai_key
    ```
    Replace `your_openai_key` with your actual OpenAI key.

5. Go back to the root directory and run the Python application:
    ```
    cd ..
    python app.py
    ```
    Navigate to the printed URL.

6. Now you're ready to use the application. Upload a small PDF file and ask a question.

## Built With

- [Next.js](https://nextjs.org/) - A React Framework.
- [TypeScript](https://www.typescriptlang.org/) - A statically typed superset of JavaScript
- [Python 3.11](https://www.python.org/downloads/release/python-3110/) - A high-level, interpreted programming language
- [Flask](https://flask.palletsprojects.com/) - A micro web framework written in Python

## Contributing

Any contributions you make are greatly appreciated.

## License

Distributed under the MIT License. See `LICENSE` for more information.

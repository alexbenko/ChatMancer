# AskGPT

## Description
AskGPT is an innovative project that facilitates the uploading of a PDF document, allowing users to engage with GPT to pose questions about the content. Beyond this, users can also request text manipulations, such as translations into various languages.

This application is currently a proof of concept and is not intended for production use. Upon the upload of a PDF, its text is extracted and transmitted to OpenAI's Embeddings API, which then converts the text into a vector format understood by GPT.

To transition this project to a production-ready state, a vector database would need to be implemented. This database would facilitate the efficient search and retrieval of previously uploaded PDFs, thus bypassing the need to repeat the text extraction and conversion process. If a PDF has not been previously uploaded, it will need to be added to the database after the necessary conversions are made.
## Project Setup

Follow the instructions below to set up the project on your local machine for development and testing purposes.

1. Clone the repository:
    ```
    git clone [<repository-url>](https://github.com/alexbenko/AskGPT.git)
    ```
2. Navigate into the `web` directory and build the Next.js project:
    ```
    cd web
    npm install
    npm run build
    ```
    Wait for the build process to complete.

3. Ensure you have an API key from OpenAI.

4. Set up the required environment variable with your OpenAI API key:
    ```
    export OPEN_AI_KEY=your_openai_key
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

- [Next.js](https://nextjs.org/) - A React Framework used for setting up TypeScript and exporting using `npm run build`
- [TypeScript](https://www.typescriptlang.org/) - A statically typed superset of JavaScript
- [Python](https://www.python.org/) - A high-level, interpreted programming language
- [Flask](https://flask.palletsprojects.com/) - A micro web framework written in Python

## Contributing

Any contributions you make are greatly appreciated.

## License

Distributed under the MIT License. See `LICENSE` for more information.

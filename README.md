# AskGPT

## Demo

https://github.com/alexbenko/AskGPT/assets/37863173/d4b3dff5-e4cc-40fa-b94e-7e422c63ef57

## Description

AskGPT is an app that leverages the power of a LLM (currently GPT) to offer a dynamic and interactive user experience, inspired by OpenAI's ChatGPT. This application stands out with its ability to maintain context in conversations and generate images based on user requests. And could potentially be a cheaper alternative than ChatGpt plus with the ability to use models only available using the OpenAi API.

## Key Features

### Contextual Conversations

AskGPT is adept at remembering the context from previous user interactions, enabling continuous and coherent dialogues. This feature allows for in-depth discussions and efficient follow-up questions, enhancing the user experience significantly.

### Image Generation Capability

A distinctive feature of AskGPT is the integration of the `/image` command. Users can prompt the creation of images by entering `/image` followed by a descriptive brief. The application seamlessly processes this command, connecting with an image generation API (currently uses DALL·E) to produce visual content that aligns with the user's description. This innovative functionality adds a creative dimension to the interaction, enriching the overall experience.

## Current State and Future Development

AskGPT, with its advanced conversation memory and image generation features, is a sophisticated tool designed for a wide range of interactive experiences. As the application evolves, I will reintroduce the ability to interact with PDF documents, allowing users to discuss and analyze content within these documents seamlessly.

## Usage Costs

Please note that running this application involves usage of certain APIs that are not free of charge. Costs depend on the volume of use. However, for personal use, these APIs are generally quite affordable. For instance, during my personal usage of the app, the highest monthly bill I ever received was only $8. I was using multiple services that month like Dalle and played A LOT with AutoGPT.

While this is relatively low, costs can vary based on usage, so it's important to monitor your usage to avoid any surprises. Please ensure you understand the pricing details of these APIs before using the application. In the billing section of the Open Ai Developer page, you can set usage limits. I set my account to max out at $20/month.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the /api directory. These variables are crucial for securing the application and connecting to external services.

### `OPENAI_API_KEY`

This is your OpenAI API key, used to authenticate requests to OpenAI services such as GPT and DALL-E. Ensure that you have an active OpenAI account and have generated an API key. This key enables the application to interact with OpenAI's powerful AI models.

### `PASSWORD`

This variable acts as a simple security measure to protect access to your project, especially when deployed on the internet. You can set this to any string value you prefer. This password should be kept confidential and only shared with authorized users.

## Project Setup With Docker

If you just want to play with this locally and know how to use docker follow these steps.

1. Clone the repository:

   ```
   git clone https://github.com/alexbenko/AskGPT.git
   ```

   ```
   cd AskGPT
   ```

2. Create and fill required values in .env file in /api
3. Run command at root
   ```
   docker build -t askgpt .
   ```
4. Start docker
   ```
   docker run -p 8000:8000 askgpt
   ```
5. Click on the printed url, enter your password, and start chatting!

## Project Setup Without Docker

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
3. Ensure you have an API key from OpenAI.

4. Set your enviornment variables in a .env file inside the /api directory:

   ```
   OPENAI_API_KEY=your_openai_key
   PASSWORD=your_chosen_password
   ```

   Replace `your_openai_key` with your actual OpenAI key.

5. Navigate to the `api` directory and start the Python backend application:

   ```
   python main.py
   ```

   This will launch the backend server.

6. Navigate into the `web` directory and install dependencies, then build the Vite.js project:

   ```
   cd web
   npm install
   npm run dev
   ```

7. You can access the application by navigating to the printed URL.

## Built With

- [Vite](https://vitejs.dev/) - A lightweight and fast build tool for modern JavaScript applications, designed for quick development and efficient production builds.
- [React](https://react.dev/) - A JavaScript library for building user interfaces, developed and maintained by Facebook.
- [TypeScript](https://www.typescriptlang.org/) - A statically typed superset of JavaScript
- [Python 3.11](https://www.python.org/downloads/release/python-3110/) - A high-level, interpreted programming language
- [FastApi](https://fastapi.tiangolo.com/) - A modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.
- [NPM](https://www.npmjs.com/) - A package manager for JavaScript, widely used to manage dependencies in Javascript projects and to share and install open-source JavaScript packages.
- [PIP](https://pypi.org/project/pip/) - A package manager for Python that simplifies the installation and management of software packages from the Python Package Index (PyPI).

## Contributing

Any contributions you make are greatly appreciated.

## License

Distributed under the MIT License. See `LICENSE` for more information.

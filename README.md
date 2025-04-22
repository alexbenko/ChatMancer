# ChatMancer

## Demo
[![Watch the demo](https://img.youtube.com/vi/kge54-PCwww/maxresdefault.jpg)](https://youtu.be/kge54-PCwww)



## 🔑 Highlights:
✍️ Contextual Conversations – remembers your chat history across messages

🤖 Model Switching – change models (e.g. GPT-3.5 ↔ GPT-4) on the fly without losing context

🖼️ Image Generation – describe what you want and get visuals via DALL·E

📄 PDF Q&A – upload a PDF and ask natural questions about its contents

🔐 Secure Auth – session-based access with password + token + CSRF protection

🧠 Code Display – beautifully rendered code with syntax highlighting and language labels


## Description

ChatMancer is a full-stack app powered by large language models (LLMs) that delivers an advanced, ChatGPT-like experience with added flexibility, control, and lower cost potential. Built on OpenAI's API, it supports contextual conversations, image generation, and document analysis — with full model-switching support.

## Key Features

### 👁‍ Contextual Conversations with Session Memory
- Custom memory system preserves message history across requests using session IDs.
- Tracks user/AI messages, model used, and content type (text or image).
- Supports future features like analytics, streaming, or persistent logging.

### 🌍 Dynamic Model Switching
- Easily switch between models (e.g., GPT-4, Claude) at any time.
- Session memory remains intact regardless of which model is used.
- Chat history is tracked separately from the LLM logic for full flexibility.

### 📷 Natural Language Image Generation
- Users can generate images using natural prompts like "draw a dragon in a coffee cup" — no command prefix needed.
- Powered by DALL·E.
- Image messages are stored with `content_type: "image"` for structured frontend rendering.

### 📄 PDF Document Q&A
- Upload a PDF and ask questions about it directly.
- RAG (retrieval augmented generation) pipeline extracts and answers using the document.
- Automatically detects relevant context without requiring a command prefix.

### 🚀 Fully Customizable & Extendable
- Uses custom `invoke_with_metadata()` to manage LLM execution, memory storage, and message tagging in one place.
- Code blocks are rendered with fenced Markdown (```lang) and copy buttons for readability.
- Flexible memory architecture supports per-message metadata, like model and content type.

## Future Features

1. <strike>Text file upload support</strike> (already supported via PDF)
2. Add support for pulling content from URLs
3. GPT Vision / image Q&A support
4. Persistent model selection with historical tracking
5. WebSocket support for live updates

## Usage Costs

This project uses OpenAI's APIs, which are not free. Costs depend on:
- Number of requests
- Models used (e.g., GPT-4 is more expensive than GPT-3.5)
- Image generation and embeddings

Most casual users will spend <$10/month, but you can set limits via your OpenAI billing dashboard (e.g., $20 cap).

## Environment Variables

In your `.env` file under `/api`:

### `OPENAI_API_KEY`
Your OpenAI API key. Required for GPT and DALL-E access.

### `PASSWORD`
Password protection for the app interface (basic access control).

## Project Setup With Docker

```bash
git clone https://github.com/alexbenko/ChatMancer.git
cd ChatMancer
```

1. Add `.env` to `/api` with required variables.
2. Build Docker image:
```bash
docker build -t chatmancer .
```
3. Run it:
```bash
docker run -p 8000:8000 chatmancer
```
4. Open the printed URL, enter the password, and chat away.

## Project Setup Without Docker

```bash
git clone https://github.com/alexbenko/ChatMancer.git
cd ChatMancer
```

1. Install Python server deps:
```bash
pip install -r requirements.txt
```
2. Add your `.env` file in `/api`:
```env
OPENAI_API_KEY=your_key
PASSWORD=your_password
```
3. Start backend:
```bash
cd api
python main.py
```
4. Start frontend:
```bash
cd ../web
npm install
npm run dev
```
5. Visit the printed URL and authenticate.

## Built With

- [Vite](https://vitejs.dev/) — Lightning-fast frontend tooling
- [React](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — Static typing
- [Python 3.11](https://www.python.org/downloads/release/python-3110/) — Backend language
- [FastAPI](https://fastapi.tiangolo.com/) — Async web framework
- [LangChain](https://www.langchain.com/) — LLM orchestration and memory
- [OpenAI API](https://platform.openai.com/) — GPT + DALL-E access

## Contributing

Open to PRs, ideas, and feedback!

## License

see `LICENSE` for full details.


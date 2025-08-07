# 🕵️‍♂️ Agent Smith - Conversational AI with Real-Time Web Tools

**Agent Smith** is a LangChain-powered conversational AI assistant that uses OpenAI's GPT model and Tavily tools to search the web and extract real-time information.

> “Mr. Anderson... I found the current weather in Auckland.”

---

## 🧠 Features

- 💬 Multi-turn conversational agent (chat memory)
- 🔎 Real-time **web search** via Tavily API
- 📄 **Webpage content extraction** (raw HTML content)
- 🔧 Fully integrated with LangChain’s `createOpenAIToolsAgent`
- 🖥️ CLI-based chat interface
- 🌐 Built using `Node.js`, `LangChain`, `Tavily`, and `OpenAI`

---

## 📦 Technologies Used

| Tool/Service         | Purpose                             |
|----------------------|-------------------------------------|
| `LangChain`          | Conversational agent orchestration  |
| `OpenAI`             | GPT-3.5 Turbo language model        |
| `@tavily/core`       | Extracting raw webpage content      |
| `@langchain/tavily`  | Web search (TavilySearch)           |
| `Zod`                | Tool input validation               |
| `readline`           | CLI input handling                  |
| `dotenv`             | Environment variable management     |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/agent-smith-ai.git
cd agent-smith-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root folder:

```env
OPENAI_API_KEY=your-openai-api-key
TAVILY_API_KEY=your-tavily-api-key
```

---

## 🧪 Running the Agent

Start the interactive CLI agent:

```bash
node agent.js
```

Example:

```bash
User: Hello, who are you?
Agent Smith: I am Agent Smith, your helpful assistant. How can I assist you today?

User: What is the weather in Auckland?
Agent Smith: The current weather in Auckland, New Zealand is...
```

Type `exit` to quit the program.

---

## 🛠️ Project Structure

```
├── agent.js          # Main CLI application
├── package.json
├── .env              # Your API keys (excluded from repo)
└── README.md         # Project documentation
```

---

## ✅ Current Capabilities

- 🧠 Maintains multi-turn chat history
- 🌐 Uses **TavilySearch** to find up-to-date info
- 📄 Uses **TavilyExtract** to get raw content from URLs
- 💬 Responds conversationally based on tools + chat context

---

## 💡 Future Ideas

- 🔄 Streamed responses (word-by-word)
- 🖼️ Frontend chat UI (React or HTML+JS)
- 💾 Save chat logs to file/database
- ➕ Add more tools: Wikipedia, Math, Currency, Browser

---

## 📜 License

MIT © 2025 [Erekle Sesiashvili](https://github.com/yourusername)

---

## 🤝 Credits

- [LangChain.js](https://js.langchain.com/)
- [Tavily AI](https://tavily.com/)
- [OpenAI API](https://platform.openai.com/)

---

_“Never send a human to do a machine’s job.” — Agent Smith_

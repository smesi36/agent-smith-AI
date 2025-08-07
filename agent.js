import * as dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredTool } from "@langchain/core/tools";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { tavily } from "@tavily/core";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

import fs from "fs";

// Save history
// fs.writeFileSync("memory/history.json", JSON.stringify(chat_history, null, 2));
//
// 🧠 Wrapped TavilySearch Tool
//
class WrappedTavilySearch extends StructuredTool {
  name = "tavily_search";
  description = "Search the web for up-to-date information.";

  schema = z.object({
    query: z.string().describe("Search query to look up."),
  });

  constructor() {
    super();
    this.tool = new TavilySearch();
  }

  async _call({ query }) {
    const result = await this.tool.invoke({ query });
    // Force output to a string to avoid formatting errors
    const output =
      typeof result === "string"
        ? result
        : result?.answer || JSON.stringify(result);
    // console.log("🔎 TavilySearch result:", output);
    return output;
  }
}

//
// 📄 Tavily Extract Tool (web content extractor)
//
class TavilyExtractTool extends StructuredTool {
  name = "tavily_extract";
  description = "Extract raw content from a specific webpage.";

  schema = z.object({
    url: z.string().url().describe("The full URL of the webpage to extract."),
  });

  constructor() {
    super();
    this.tavily = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }

  async _call({ url }) {
    // console.log("🌐 TavilyExtractTool invoked with URL:", url);
    const response = await this.tavily.extract(url);
    // console.log("📦 Extract response:", JSON.stringify(response, null, 2));
    const content = response?.results?.[0]?.rawContent;

    if (!content) {
      console.warn("⚠️ No content found in response.");
      return "No content found.";
    }

    return `Extracted content: ${content.slice(0, 1000)}...`;
  }
}

//
// 🧠 Main function
//
async function main() {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.2,
  });

  // Ensure memory directory exists
  if (!fs.existsSync("memory")) {
    fs.mkdirSync("memory");
  }

  const tools = [new WrappedTavilySearch(), new TavilyExtractTool()];

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant called Agent Smith."],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createOpenAIToolsAgent({
    llm: model,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({ agent, tools });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // --------------- LONG TERM CHAT HISTORY --------------- //
  // const chat_history = [];
  let chat_history = [];

  try {
    const saved = fs.readFileSync("memory/history.json", "utf-8");
    chat_history = JSON.parse(saved).map((msg) =>
      msg.type === "human"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );
    console.log("🧠 Loaded previous chat history.");
    // show name if remembered
    const lastHumanMsg = chat_history.find((m) => m._getType() === "human");
    if (lastHumanMsg?.content?.toLowerCase().includes("my name is")) {
      console.log("👋 Welcome back!");
    }
  } catch {
    console.log("📭 No saved history found, starting fresh.");
  }

  function askQuestion() {
    rl.question("User: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("Agent Smith: Goodbye Mr. Anderson!");
        rl.close();
        return;
      }

      // Command to clear history
      if (input.toLowerCase() === "clear") {
        fs.unlinkSync("memory/history.json");
        console.log("🧽 Memory wiped clean.");
        chat_history = [];
        askQuestion();
        return;
      }

      const response = await executor.invoke({
        input,
        chat_history,
      });

      // console.log("🧠 Raw agent response:", JSON.stringify(response, null, 2));
      console.log(`Agent Smith: ${response.output}`);

      chat_history.push(new HumanMessage(input));
      chat_history.push(new AIMessage(response.output));

      // Save updated history to a file. This is the long term chat history
      fs.writeFileSync(
        "memory/history.json",
        JSON.stringify(
          chat_history.map((msg) => ({
            type: msg._getType(), // "human" or "ai"
            content: msg.content,
          })),
          null,
          2
        )
      );

      askQuestion();
    });
  }

  askQuestion();
}

main().catch((err) => {
  console.error("❌ Error running agent:", err);
  process.exit(1);
});

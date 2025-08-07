import * as dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredTool } from "@langchain/core/tools";
import {
  AgentExecutor,
  createOpenAIToolsAgent,
} from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { tavily } from "@tavily/core";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

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
    const output = typeof result === "string"
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

  const chat_history = [];

  function askQuestion() {
    rl.question("User: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("Agent: Goodbye Mr. Anderson!");
        rl.close();
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

      askQuestion();
    });
  }

  askQuestion();
}

main().catch((err) => {
  console.error("❌ Error running agent:", err);
  process.exit(1);
});


// src/agent/connectaAgent.ts
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "@langchain/memory";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

import { tools } from "./tools/index.js";
import { intentPrompt, IntentSchema } from "./prompts/intent-prompt.js";

export interface ConnectaAgentConfig {
  apiBaseUrl: string;
  authToken: string;
  openaiApiKey: string;
}

export class ConnectaAgent {
  private model: ChatOpenAI;
  private memory: BufferMemory;
  private toolMap: Record<string, any>;

  constructor(private config: ConnectaAgentConfig) {
    this.model = new ChatOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || config.openaiApiKey,
      model: "deepseek/deepseek-coder-33b-instruct",
      baseURL: "https://openrouter.ai/api/v1",
      temperature: 0,
    });

    this.memory = new BufferMemory();

    // Map tools by their registered names
    this.toolMap = {
      update_profile_tool: new tools.UpdateProfileTool(config.apiBaseUrl, config.authToken),
      create_cover_letter_tool: new tools.CreateCoverLetterTool(config.apiBaseUrl, config.authToken),
      get_matched_gigs_tool: new tools.GetMatchedGigsTool(config.apiBaseUrl, config.authToken),
    };
  }

  /**
   * Process natural language user input
   * by interpreting intent → selecting tool → executing → returning result.
   */
  async process(input: string): Promise<any> {
    try {
      const promptTemplate = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(intentPrompt),
        HumanMessagePromptTemplate.fromTemplate("{input}"),
      ]);

      const outputParser = new JsonOutputParser();

      const chain = RunnableSequence.from([
        {
          input: new RunnablePassthrough(),
          history: async () => this.memory.loadMemoryVariables({}),
        },
        promptTemplate,
        this.model,
        outputParser,
        async (parsed: unknown) => {
          const validatedOutput = IntentSchema.parse(parsed);
          const selectedTool = this.toolMap[validatedOutput.tool];
          if (!selectedTool) throw new Error(`Tool ${validatedOutput.tool} not found`);

          const result = await selectedTool.execute(validatedOutput.parameters);
          await this.memory.saveContext({ input }, { output: JSON.stringify(result) });
          return result;
        },
      ]);

      const result = await chain.invoke({ input });
      return result;
    } catch (error) {
      console.error("❌ Error processing request:", error);
      throw error;
    }
  }
}

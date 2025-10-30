// src/agent/connectaAgent.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// import { tools } from "./tools/index.js";
// ✅ Correct for TypeScript
import { tools } from "./tools";

import { intentPrompt, IntentSchema } from "./prompts/intent-prompt";

export interface ConnectaAgentConfig {
  apiBaseUrl: string;
  authToken: string;
  userId: string;
  openaiApiKey: string;
  mockMode?: boolean;
}

export class ConnectaAgent {
  private model: ChatOpenAI;
  private chatHistory: Array<{ input: string; output: string }> = [];
  private toolMap: Record<string, any>;

  constructor(private config: ConnectaAgentConfig) {
    this.model = new ChatOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || config.openaiApiKey,
      model: "deepseek/deepseek-chat",
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      temperature: 0,
    });

    // Map tools by their registered names
    const mockMode = config.mockMode ?? false;
    this.toolMap = {
      update_profile_tool: new tools.UpdateProfileTool(config.apiBaseUrl, config.authToken, config.userId, mockMode),
      create_cover_letter_tool: new tools.CreateCoverLetterTool(config.apiBaseUrl, config.authToken, mockMode),
      get_matched_gigs_tool: new tools.GetMatchedGigsTool(config.apiBaseUrl, config.authToken, mockMode),
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
          history: async () => ({
            history: this.chatHistory.map(h => `User: ${h.input}\nAssistant: ${h.output}`).join('\n\n')
          }),
        },
        promptTemplate,
        this.model,
        outputParser,
        async (parsed: unknown) => {
          const validatedOutput = IntentSchema.parse(parsed);
          const selectedTool = this.toolMap[validatedOutput.tool];
          if (!selectedTool) throw new Error(`Tool ${validatedOutput.tool} not found`);

          const result = await selectedTool._call(validatedOutput.parameters);
          this.chatHistory.push({ input, output: JSON.stringify(result) });
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

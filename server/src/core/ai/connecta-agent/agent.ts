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
    const lowerInput = input.toLowerCase().trim();

    // 1️⃣ Handle greetings and friendly small talk
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
    const gratitude = ["thanks", "thank you", "appreciate it"];
    const smallTalk = ["how are you", "who are you", "what's your name", "what can you do", "what do you do"];

    if (greetings.some(g => lowerInput.startsWith(g))) {
      const responses = [
        "👋 Hey there! I'm Connecta Assistant — your friendly helper on the Connecta platform.",
        "😊 Hi! I'm here to help you manage your profile, gigs, and cover letters.",
      ];
      const randomGreeting = responses[Math.floor(Math.random() * responses.length)];
      const followUp = "Would you like me to find gigs for you or help update your profile?";
      const message = `${randomGreeting} ${followUp}`;
      this.chatHistory.push({ input, output: message });
      return { message };
    }

    if (gratitude.some(g => lowerInput.includes(g))) {
      const message = "You're very welcome! 🙌 I'm always here to help you on Connecta.";
      this.chatHistory.push({ input, output: message });
      return { message };
    }

    if (smallTalk.some(q => lowerInput.includes(q))) {
      let message = "";
      if (lowerInput.includes("how are you"))
        message = "I'm doing great, thanks for asking! 😊 How about you?";
      else if (lowerInput.includes("who are you") || lowerInput.includes("what's your name"))
        message = "I'm Connecta Assistant — your personal AI helping you manage your freelance journey.";
      else if (lowerInput.includes("what can you do") || lowerInput.includes("what do you do"))
        message = "I can help you update your profile, write professional cover letters, and find gigs that match your skills.";
      
      // Add a friendly follow-up
      message += " Would you like me to help with one of those now?";
      this.chatHistory.push({ input, output: message });
      return { message };
    }

    // 2️⃣ Intent detection (Connecta-specific)
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

        // Check for "none" or unknown tool
        if (validatedOutput.tool === "none" || !this.toolMap[validatedOutput.tool]) {
          const fallbackMessage =
            "⚠️ Sorry, I can only help with Connecta-related tasks — like updating your profile, writing cover letters, or finding gigs.";
          this.chatHistory.push({ input, output: fallbackMessage });
          return { message: fallbackMessage };
        }

        // 3️⃣ Run the correct tool
        const selectedTool = this.toolMap[validatedOutput.tool];
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

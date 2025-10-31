import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import axios from "axios";

// Dynamic tool loading
import { tools, loadTools } from "./tools";
import { intentPrompt, IntentSchema } from "./prompts/intent-prompt";

export interface ConnectaAgentConfig {
  apiBaseUrl: string;
  authToken: string;
  userId: string;
  conversationId?: string; // Optional conversation ID for multi-conversation support
  openaiApiKey: string;
  mockMode?: boolean;
}

interface ChatMessage {
  input: string;
  output: string;
  timestamp: Date;
  toolUsed?: string;
}

interface ConversationMemory {
  userId: string;
  conversationId: string;
  chatHistory: ChatMessage[];
  userContext: any;
  lastUpdated: Date;
}

export class ConnectaAgent {
  private model: ChatOpenAI;
  private chatHistory: ChatMessage[] = [];
  private toolMap: Record<string, any> = {};
  private userContext: any = null;
  private conversationId: string;
  private memoryStore: Map<string, ConversationMemory> = new Map(); // In-memory store
  private maxHistoryLength: number = 50; // Keep last 50 messages

  constructor(private config: ConnectaAgentConfig) {
    this.model = new ChatOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || config.openaiApiKey,
      model: "deepseek/deepseek-chat",
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      temperature: 0,
    });
    
    // Generate or use provided conversation ID
    this.conversationId = config.conversationId || `conv_${config.userId}_${Date.now()}`;
    
    // Load existing memory if available
    this.loadMemory();
  }

  /**
   * Initializes tools dynamically.
   * Must be called AFTER loadTools() in your app bootstrap.
   */
  async initializeTools() {
    const mockMode = this.config.mockMode ?? false;

    for (const [toolName, ToolClass] of Object.entries(tools)) {
      try {
        const inst = new (ToolClass as any)(
          this.config.apiBaseUrl,
          this.config.authToken,
          this.config.userId,
          mockMode
        );
        this.toolMap[inst.name] = inst;
      } catch (err) {
        console.warn("⚠️ Failed to initialize tool:", toolName, err);
      }
    }
  }

  /**
   * Load conversation memory from storage
   */
  private loadMemory(): void {
    try {
      const memoryKey = `${this.config.userId}_${this.conversationId}`;
      const stored = this.memoryStore.get(memoryKey);
      
      if (stored) {
        this.chatHistory = stored.chatHistory;
        this.userContext = stored.userContext;
        console.log(`📚 Loaded ${this.chatHistory.length} messages from memory`);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load memory:", error);
    }
  }

  /**
   * Save conversation memory to storage
   */
  private saveMemory(): void {
    try {
      const memoryKey = `${this.config.userId}_${this.conversationId}`;
      
      // Trim history to max length
      if (this.chatHistory.length > this.maxHistoryLength) {
        this.chatHistory = this.chatHistory.slice(-this.maxHistoryLength);
      }
      
      const memory: ConversationMemory = {
        userId: this.config.userId,
        conversationId: this.conversationId,
        chatHistory: this.chatHistory,
        userContext: this.userContext,
        lastUpdated: new Date(),
      };
      
      this.memoryStore.set(memoryKey, memory);
      console.log(`💾 Saved memory: ${this.chatHistory.length} messages`);
    } catch (error) {
      console.warn("⚠️ Failed to save memory:", error);
    }
  }

  /**
   * Clear conversation history
   */
  clearMemory(): void {
    this.chatHistory = [];
    this.userContext = null;
    const memoryKey = `${this.config.userId}_${this.conversationId}`;
    this.memoryStore.delete(memoryKey);
    console.log("🗑️ Memory cleared");
  }

  /**
   * Get conversation summary
   */
  getMemorySummary(): { messageCount: number; userContext: any; conversationId: string } {
    return {
      messageCount: this.chatHistory.length,
      userContext: this.userContext,
      conversationId: this.conversationId,
    };
  }

  /**
   * Get formatted chat history for context
   */
  private getFormattedHistory(limit: number = 10): string {
    const recentHistory = this.chatHistory.slice(-limit);
    return recentHistory
      .map(h => `User: ${h.input}\nAssistant: ${h.output}`)
      .join("\n\n");
  }

  /**
   * Check if user is asking about previous conversation
   */
  private isReferringToPreviousContext(input: string): boolean {
    const contextKeywords = [
      "what did i", "what was", "earlier", "before", "previous", "last time",
      "you said", "we discussed", "we talked about", "remind me",
      "what were we", "continue", "back to", "regarding"
    ];
    const lowerInput = input.toLowerCase();
    return contextKeywords.some(keyword => lowerInput.includes(keyword));
  }

  /**
   * Handles user input → detects intent → selects tool → runs tool → returns result.
   */
  async process(input: string): Promise<any> {
    try {
      // Ensure user context is loaded once per agent instance
      await this.loadUserContext();

      const lowerInput = input.toLowerCase().trim();

      // --- 0️⃣ Handle memory/context queries ---
      if (lowerInput.includes("clear chat") || lowerInput.includes("clear history") || lowerInput.includes("reset conversation")) {
        this.clearMemory();
        const message = "✨ I've cleared our conversation history. Let's start fresh! How can I help you?";
        return { message };
      }

      if (lowerInput.includes("what have we discussed") || lowerInput.includes("conversation history")) {
        const summary = this.chatHistory.length > 0
          ? `We've had ${this.chatHistory.length} exchanges. Recently we discussed:\n\n${this.getFormattedHistory(5)}`
          : "This is the start of our conversation! What would you like help with?";
        return { message: summary };
      }

      // --- 1️⃣ Handle small talk and greetings ---
      const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
      const gratitude = ["thanks", "thank you", "appreciate it"];
      const smallTalk = ["how are you", "who are you", "what's your name", "what can you do", "what do you do"];

      if (greetings.some(g => lowerInput.startsWith(g))) {
        const userName = this.userContext?.name ? `, ${this.userContext.name}` : "";
        const responses = [
          `👋 Hey there${userName}! I'm Connecta Assistant — your friendly helper on the Connecta platform.`,
          `😊 Hi${userName}! I'm here to help you manage your profile, gigs, and cover letters.`,
        ];
        const randomGreeting = responses[Math.floor(Math.random() * responses.length)];
        
        // Add context if returning user
        const contextNote = this.chatHistory.length > 0
          ? " Welcome back! Ready to continue where we left off?"
          : " Would you like me to find gigs for you or help update your profile?";
        
        const message = `${randomGreeting}${contextNote}`;
        this.addToHistory(input, message);
        return { message };
      }

      if (gratitude.some(g => lowerInput.includes(g))) {
        const message = "You're very welcome! 🙌 I'm always here to help you on Connecta.";
        this.addToHistory(input, message);
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
        message += " Would you like me to help with one of those now?";
        this.addToHistory(input, message);
        return { message };
      }

      // --- 2️⃣ Enhanced Intent detection with conversation context ---
      const promptTemplate = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(intentPrompt),
        SystemMessagePromptTemplate.fromTemplate("User context (for personalization):\n{userContext}"),
        SystemMessagePromptTemplate.fromTemplate("Recent conversation history:\n{history}"),
        HumanMessagePromptTemplate.fromTemplate("{input}"),
      ]);

      const chain = RunnableSequence.from([
        {
          input: new RunnablePassthrough(),
          history: async () => this.getFormattedHistory(5),
          userContext: async () => JSON.stringify(this.userContext ?? {}),
        },
        promptTemplate,
        this.model,
        async (rawOutput: any) => {
          let textOutput = typeof rawOutput === "string" ? rawOutput : rawOutput?.content || "";
          console.log("🧠 RAW MODEL OUTPUT:", textOutput);

          // Clean Markdown and trim
          textOutput = textOutput
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          let parsedOutput;
          try {
            parsedOutput = JSON.parse(textOutput);
          } catch (err) {
            console.error("⚠️ JSON parse error:", err, "\nRAW:", textOutput);
            throw new Error("Failed to parse model output as JSON");
          }

          const validatedOutput = IntentSchema.parse(parsedOutput);
          console.log("✅ VALIDATED OUTPUT:", validatedOutput);

          if (validatedOutput.tool === "none" || !this.toolMap[validatedOutput.tool]) {
            const fallbackMessage =
              "⚠️ Sorry, I can only help with Connecta-related tasks — like updating your profile, writing cover letters, or finding gigs.";
            this.addToHistory(input, fallbackMessage);
            return { message: fallbackMessage };
          }

          const selectedTool = this.toolMap[validatedOutput.tool];
          const result = await selectedTool._call(validatedOutput.parameters);

          // If tool failed, provide a friendly explanation instead of raw error
          if (!result?.success) {
            const friendly = await this.explainError(validatedOutput.tool, result?.message ?? "Unknown error");
            this.addToHistory(input, friendly, validatedOutput.tool);
            return { message: friendly };
          }

          // Success but empty payload → return friendly message
          if (this.isEmptyResult(result)) {
            const friendly = this.emptyMessage(validatedOutput.tool);
            this.addToHistory(input, friendly, validatedOutput.tool);
            return { message: friendly };
          }

          this.addToHistory(input, JSON.stringify(result), validatedOutput.tool);
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

  /**
   * Add message to history and save to memory
   */
  private addToHistory(input: string, output: string, toolUsed?: string): void {
    this.chatHistory.push({
      input,
      output,
      timestamp: new Date(),
      toolUsed,
    });
    this.saveMemory();
  }

  private async explainError(tool: string, error: string): Promise<string> {
    try {
      const prompt = ChatPromptTemplate.fromTemplate(
        "You are an assistant for the Connecta app. In 1 short sentence, explain this tool failure in simple, friendly terms and suggest one next step. Do not include technical details or stack traces. Tool: {tool}. Error: {error}."
      );
      const chain = RunnableSequence.from([
        prompt,
        this.model,
        new StringOutputParser(),
      ]);
      const msg = await chain.invoke({ tool, error });
      return (msg || "Sorry, I couldn't complete that just now. Please try again in a moment.").trim();
    } catch {
      return "Sorry, I couldn't complete that just now. Please try again in a moment.";
    }
  }

  private async loadUserContext(): Promise<void> {
    if (this.userContext !== null) return;
    try {
      const url = `${this.config.apiBaseUrl}/api/profiles/${this.config.userId}`;
      const res = await axios.get(url, {
        headers: this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : {},
      });
      const profile = res.data;
      const userType = profile?.user?.userType || profile?.userType;
      const name = profile?.user?.firstName || profile?.firstName;
      this.userContext = { userId: this.config.userId, userType, name, profile };
      this.saveMemory(); // Save updated context
    } catch (e) {
      this.userContext = { userId: this.config.userId };
    }
  }

  private isEmptyResult(result: any): boolean {
    const d = result?.data;
    if (d == null) return true;
    if (Array.isArray(d)) return d.length === 0;
    if (typeof d === "object") {
      if (Array.isArray(d.data) && d.data.length === 0) return true;
      if (typeof d.count === "number" && d.count === 0) return true;
    }
    return false;
  }

  private emptyMessage(tool: string): string {
    const map: Record<string, string> = {
      get_messages_tool: "You don't have any recent conversations yet.",
      get_user_messages_tool: "You don't have any recent conversations yet.",
      get_matched_gigs_tool: "I couldn't find any matching gigs right now.",
      get_recommended_gigs_tool: "No recommended gigs at the moment.",
      get_saved_gigs_tool: "You haven't saved any gigs yet.",
      get_saved_cover_letters_tool: "You don't have any saved cover letters yet.",
      track_gig_applications_tool: "You don't have any applications to show yet.",
      get_profile_details_tool: "I couldn't find your profile information.",
      get_profile_analytics_tool: "No profile analytics available yet.",
    };
    const msg = map[tool] || "I couldn't find anything to show for that just yet.";
    return `${msg} Want me to help you get started?`;
  }
}
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectaAgent = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const runnables_1 = require("@langchain/core/runnables");
const output_parsers_1 = require("@langchain/core/output_parsers");
// import { z } from "zod";
const axios_1 = __importDefault(require("axios"));
// Dynamic tool loading
const tools_1 = require("./tools");
const intent_prompt_1 = require("./prompts/intent-prompt");
class ConnectaAgent {
    constructor(config) {
        this.config = config;
        this.chatHistory = [];
        this.toolMap = {};
        this.userContext = null;
        this.memoryStore = new Map();
        this.responseCache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.sessionMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalResponseTime: 0,
        };
        this.model = new openai_1.ChatOpenAI({
            apiKey: process.env.OPENROUTER_API_KEY || config.openaiApiKey,
            model: "deepseek/deepseek-chat",
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
            },
            temperature: config.temperature ?? 0.3, // Slightly creative but focused
            maxTokens: 2000,
        });
        this.conversationId = config.conversationId || `conv_${config.userId}_${Date.now()}`;
        this.maxHistoryLength = config.maxHistoryLength ?? 50;
        this.loadMemory();
    }
    /**
     * Initializes tools dynamically with error handling and validation
     */
    async initializeTools() {
        const mockMode = this.config.mockMode ?? false;
        let successCount = 0;
        let failCount = 0;
        for (const [toolName, ToolClass] of Object.entries(tools_1.tools)) {
            try {
                const inst = new ToolClass(this.config.apiBaseUrl, this.config.authToken, this.config.userId, mockMode);
                // Validate tool has required methods
                if (!inst.name || typeof inst._call !== 'function') {
                    throw new Error(`Invalid tool structure for ${toolName}`);
                }
                this.toolMap[inst.name] = inst;
                successCount++;
            }
            catch (err) {
                failCount++;
                console.warn(`⚠️ Failed to initialize tool: ${toolName}`, err);
            }
        }
        console.log(`✅ Tools initialized: ${successCount} successful, ${failCount} failed`);
    }
    /**
     * Load conversation memory with migration support
     */
    loadMemory() {
        try {
            const memoryKey = `${this.config.userId}_${this.conversationId}`;
            const stored = this.memoryStore.get(memoryKey);
            if (stored) {
                this.chatHistory = stored.chatHistory;
                this.userContext = stored.userContext;
                console.log(`📚 Loaded ${this.chatHistory.length} messages from memory`);
            }
        }
        catch (error) {
            console.warn("⚠️ Failed to load memory:", error);
        }
    }
    /**
     * Save conversation memory with session metrics
     */
    saveMemory() {
        try {
            const memoryKey = `${this.config.userId}_${this.conversationId}`;
            if (this.chatHistory.length > this.maxHistoryLength) {
                this.chatHistory = this.chatHistory.slice(-this.maxHistoryLength);
            }
            const successfulTools = this.chatHistory.filter(m => m.success).length;
            const failedTools = this.chatHistory.filter(m => m.success === false).length;
            const memory = {
                userId: this.config.userId,
                conversationId: this.conversationId,
                chatHistory: this.chatHistory,
                userContext: this.userContext,
                lastUpdated: new Date(),
                sessionMetadata: {
                    totalTools: successfulTools + failedTools,
                    successfulTools,
                    failedTools,
                    averageResponseTime: this.sessionMetrics.totalRequests > 0
                        ? this.sessionMetrics.totalResponseTime / this.sessionMetrics.totalRequests
                        : 0,
                },
            };
            this.memoryStore.set(memoryKey, memory);
        }
        catch (error) {
            console.warn("⚠️ Failed to save memory:", error);
        }
    }
    /**
     * Clear conversation history
     */
    clearMemory() {
        this.chatHistory = [];
        this.userContext = null;
        this.responseCache.clear();
        const memoryKey = `${this.config.userId}_${this.conversationId}`;
        this.memoryStore.delete(memoryKey);
        console.log("🗑️ Memory cleared");
    }
    /**
     * Get conversation summary with analytics
     */
    getMemorySummary() {
        return {
            messageCount: this.chatHistory.length,
            userContext: this.userContext,
            conversationId: this.conversationId,
            metrics: this.sessionMetrics,
        };
    }
    /**
     * Get formatted chat history with smart truncation
     */
    getFormattedHistory(limit = 10) {
        const recentHistory = this.chatHistory.slice(-limit);
        return recentHistory
            .map(h => {
            const toolInfo = h.toolUsed ? ` [Tool: ${h.toolUsed}]` : '';
            return `User: ${h.input}\nAssistant: ${h.output}${toolInfo}`;
        })
            .join("\n\n");
    }
    /**
     * Check cache for similar recent queries
     */
    getCachedResponse(input) {
        const normalizedInput = input.toLowerCase().trim();
        const cached = this.responseCache.get(normalizedInput);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            console.log("⚡ Cache hit for:", input.substring(0, 50));
            return cached.response;
        }
        return null;
    }
    /**
     * Cache response for quick retrieval
     */
    cacheResponse(input, response) {
        const normalizedInput = input.toLowerCase().trim();
        this.responseCache.set(normalizedInput, {
            response,
            timestamp: Date.now(),
        });
        // Cleanup old cache entries
        if (this.responseCache.size > 100) {
            const oldestKey = Array.from(this.responseCache.keys())[0];
            this.responseCache.delete(oldestKey);
        }
    }
    /**
     * Generate contextual suggestions based on user intent and history
     */
    async generateSuggestions(input, result) {
        const suggestions = [];
        const lowerInput = input.toLowerCase();
        // Profile-related suggestions
        if (lowerInput.includes("profile")) {
            suggestions.push("Would you like me to analyze your profile strength?");
            suggestions.push("I can suggest improvements to make your profile stand out");
        }
        // Gig-related suggestions
        if (lowerInput.includes("gig") || lowerInput.includes("job")) {
            suggestions.push("Want me to find more gigs matching your skills?");
            suggestions.push("I can help you write a cover letter for any gig");
        }
        // Empty results suggestions
        if (this.isEmptyResult(result)) {
            if (this.userContext?.userType === "freelancer") {
                suggestions.push("Let me help you improve your profile to get more matches");
                suggestions.push("I can show you trending skills in your field");
            }
        }
        // Dynamic suggestions based on recent activity
        const recentTools = this.chatHistory.slice(-3).map(h => h.toolUsed).filter(Boolean);
        if (recentTools.includes("get_matched_gigs_tool") && !recentTools.includes("create_cover_letter_tool")) {
            suggestions.push("Ready to apply? I can help you create a cover letter");
        }
        return suggestions.slice(0, 2); // Return top 2 suggestions
    }
    /**
     * Enhanced error recovery with retry logic
     */
    async handleToolError(tool, error, parameters, retryCount = 0) {
        console.error(`❌ Tool ${tool} failed (attempt ${retryCount + 1}):`, error);
        // Retry logic for transient errors
        if (retryCount < 2 && this.isRetriableError(error)) {
            console.log(`🔄 Retrying ${tool}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            try {
                const selectedTool = this.toolMap[tool];
                return await selectedTool._call(parameters);
            }
            catch (retryError) {
                return this.handleToolError(tool, retryError, parameters, retryCount + 1);
            }
        }
        return {
            success: false,
            message: await this.explainError(tool, error?.message || "Unknown error"),
        };
    }
    /**
     * Check if error is retriable
     */
    isRetriableError(error) {
        const retriableErrors = [
            "ECONNREFUSED",
            "ETIMEDOUT",
            "ENOTFOUND",
            "network error",
            "timeout",
            "503",
            "502",
            "429", // Rate limit
        ];
        const errorMsg = (error?.message || error?.toString() || "").toLowerCase();
        return retriableErrors.some(err => errorMsg.includes(err.toLowerCase()));
    }
    /**
     * Proactive context management
     */
    async ensureContextFreshness() {
        if (!this.userContext || !this.userContext.lastFetched) {
            await this.loadUserContext();
            return;
        }
        const hoursSinceLastFetch = (Date.now() - this.userContext.lastFetched) / (1000 * 60 * 60);
        // Refresh context if older than 1 hour
        if (hoursSinceLastFetch > 1) {
            console.log("🔄 Refreshing stale user context...");
            this.userContext = null;
            await this.loadUserContext();
        }
    }
    /**
     * Main processing method with enhanced intelligence
     */
    async process(input) {
        const startTime = Date.now();
        this.sessionMetrics.totalRequests++;
        // Mock Mode Bypass
        if (this.config.mockMode) {
            return this.createResponse(`[MOCK] I received your message: "${input}". Since I am in mock mode, I cannot process complex requests, but I am connected!`, { originalInput: input }, true, startTime);
        }
        try {
            // Ensure fresh context
            await this.ensureContextFreshness();
            const lowerInput = input.toLowerCase().trim();
            // Check cache first
            const cached = this.getCachedResponse(input);
            if (cached) {
                return {
                    ...cached,
                    metadata: {
                        responseTime: Date.now() - startTime,
                        cached: true,
                    },
                };
            }
            // --- Memory Management Commands ---
            if (lowerInput.includes("clear chat") || lowerInput.includes("clear history") || lowerInput.includes("reset conversation")) {
                this.clearMemory();
                const message = "✨ I've cleared our conversation history. Let's start fresh! How can I help you?";
                return this.createResponse(message, null, true, startTime);
            }
            if (lowerInput.includes("what have we discussed") || lowerInput.includes("conversation history")) {
                const summary = this.chatHistory.length > 0
                    ? `We've had ${this.chatHistory.length} exchanges. Recently we discussed:\n\n${this.getFormattedHistory(5)}`
                    : "This is the start of our conversation! What would you like help with?";
                return this.createResponse(summary, null, true, startTime);
            }
            // --- Small Talk with Personality ---
            const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "sup", "yo"];
            const gratitude = ["thanks", "thank you", "appreciate it", "thx"];
            const smallTalk = ["how are you", "who are you", "what's your name", "what can you do", "what do you do"];
            if (greetings.some(g => lowerInput.startsWith(g))) {
                const userName = this.userContext?.name ? `, ${this.userContext.name}` : "";
                const timeOfDay = new Date().getHours();
                const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 18 ? "Good afternoon" : "Good evening";
                const responses = [
                    `${greeting}${userName}! 👋 I'm Connecta Assistant — here to supercharge your freelance journey.`,
                    `Hey${userName}! 😊 Ready to tackle some gigs or polish your profile?`,
                ];
                const randomGreeting = responses[Math.floor(Math.random() * responses.length)];
                const contextNote = this.chatHistory.length > 0
                    ? " Welcome back! Want to continue where we left off?"
                    : " What would you like to accomplish today?";
                const message = `${randomGreeting}${contextNote}`;
                return this.createResponse(message, null, true, startTime, [
                    "Find gigs matching my skills",
                    "Show my profile analytics",
                    "Help me write a cover letter",
                ]);
            }
            if (gratitude.some(g => lowerInput.includes(g))) {
                const responses = [
                    "You're very welcome! 🙌 Always happy to help.",
                    "No problem at all! That's what I'm here for. 😊",
                    "Anytime! Let me know if you need anything else.",
                ];
                const message = responses[Math.floor(Math.random() * responses.length)];
                return this.createResponse(message, null, true, startTime);
            }
            if (smallTalk.some(q => lowerInput.includes(q))) {
                let message = "";
                if (lowerInput.includes("how are you"))
                    message = "I'm doing fantastic! 😊 Ready to help you succeed on Connecta. How about you?";
                else if (lowerInput.includes("who are you") || lowerInput.includes("what's your name"))
                    message = "I'm Connecta Assistant — your AI-powered partner for freelancing success. Think of me as your personal career coach! 💼";
                else if (lowerInput.includes("what can you do") || lowerInput.includes("what do you do"))
                    message = "Great question! I can:\n• Find perfect gigs for you\n• Write compelling cover letters\n• Analyze your profile\n• Track applications\n• Give career insights\n\nAnd much more!";
                return this.createResponse(message, null, true, startTime, [
                    "Show me what you can do with my profile",
                    "Find gigs for me",
                ]);
            }
            // --- Intent Detection with Enhanced Context ---
            const promptTemplate = prompts_1.ChatPromptTemplate.fromMessages([
                prompts_1.SystemMessagePromptTemplate.fromTemplate(intent_prompt_1.intentPrompt),
                prompts_1.SystemMessagePromptTemplate.fromTemplate("User context:\n{userContext}"),
                prompts_1.SystemMessagePromptTemplate.fromTemplate("Conversation history:\n{history}"),
                prompts_1.HumanMessagePromptTemplate.fromTemplate("{input}"),
            ]);
            const chain = runnables_1.RunnableSequence.from([
                {
                    input: new runnables_1.RunnablePassthrough(),
                    history: async () => this.getFormattedHistory(5),
                    userContext: async () => JSON.stringify(this.userContext ?? {}),
                },
                promptTemplate,
                this.model,
                async (rawOutput) => {
                    let textOutput = typeof rawOutput === "string" ? rawOutput : rawOutput?.content || "";
                    textOutput = textOutput
                        .replace(/```json/g, "")
                        .replace(/```/g, "")
                        .trim();
                    let parsedOutput;
                    try {
                        parsedOutput = JSON.parse(textOutput);
                    }
                    catch (err) {
                        console.error("⚠️ JSON parse error:", err, "\nRAW:", textOutput);
                        throw new Error("Failed to parse model output as JSON");
                    }
                    const validatedOutput = intent_prompt_1.IntentSchema.parse(parsedOutput);
                    if (validatedOutput.tool === "none" || !this.toolMap[validatedOutput.tool]) {
                        const fallbackMessage = "⚠️ Sorry, I can only help with Connecta-related tasks — like updating your profile, writing cover letters, or finding gigs.";
                        this.chatHistory.push({ input, output: fallbackMessage, success: false, timestamp: new Date() });
                        return { message: fallbackMessage, success: false, data: null };
                    }
                    const selectedTool = this.toolMap[validatedOutput.tool];
                    const result = await selectedTool._call(validatedOutput.parameters);
                    // If tool failed, provide a friendly explanation instead of raw error
                    if (!result?.success) {
                        const friendly = await this.explainError(validatedOutput.tool, result?.message ?? "Unknown error");
                        this.chatHistory.push({ input, output: friendly, success: false, timestamp: new Date() });
                        return { message: friendly, success: false, data: null };
                    }
                    this.chatHistory.push({ input, output: JSON.stringify(result), success: true, timestamp: new Date() });
                    // Ensure result has success field
                    return { ...result, success: result.success ?? true };
                },
            ]);
            const result = await chain.invoke({ input });
            // Ensure result has proper AgentResponse structure
            if (!result || typeof result !== 'object') {
                console.warn("⚠️ Chain returned invalid result:", result);
                return this.createResponse("I encountered an issue processing your request. Please try again.", null, false, startTime);
            }
            // Ensure success field exists
            if (result.success === undefined) {
                result.success = !!result.message || !!result.data;
            }
            return result;
        }
        catch (error) {
            console.error("❌ Error processing request:", error);
            this.sessionMetrics.failedRequests++;
            // Return a proper error response instead of throwing
            return this.createResponse("I encountered an error processing your request. Please try again.", null, false, startTime);
        }
    }
    // Load user context with optional tokenless fallback
    async loadUserContext() {
        // If no auth token, try public profiles list and match by userId
        if (!this.config.authToken) {
            try {
                const res = await axios_1.default.get(`${this.config.apiBaseUrl}/api/profiles`, { timeout: 5000 });
                const profiles = Array.isArray(res.data) ? res.data : [];
                const profile = profiles.find((p) => {
                    const uid = p?.user?._id || p?.user || p?.userId;
                    return String(uid) === String(this.config.userId);
                });
                if (profile) {
                    const userType = profile?.user?.userType || profile?.userType;
                    const name = profile?.user?.firstName || profile?.firstName;
                    this.userContext = {
                        userId: this.config.userId,
                        userType,
                        name,
                        profile,
                        lastFetched: Date.now(),
                    };
                    return;
                }
            }
            catch {
                // ignore and fall through to minimal context
            }
            // Minimal context if no profile available publicly
            this.userContext = {
                userId: this.config.userId,
                lastFetched: Date.now(),
            };
            return;
        }
        // Authenticated fetch
        try {
            const res = await axios_1.default.get(`${this.config.apiBaseUrl}/api/profiles/me`, {
                headers: { Authorization: `Bearer ${this.config.authToken}` },
                timeout: 5000,
            });
            const profile = res.data;
            const userType = profile?.user?.userType || profile?.userType;
            const name = profile?.user?.firstName || profile?.firstName;
            this.userContext = {
                userId: this.config.userId,
                userType,
                name,
                profile,
                lastFetched: Date.now(),
            };
        }
        catch (e) {
            // On auth failure or any error, keep minimal context
            this.userContext = {
                userId: this.config.userId,
                lastFetched: Date.now(),
            };
        }
    }
    /**
     * Create standardized response object and record history
     */
    createResponse(message, data, success, startTime, suggestions = [], toolUsed) {
        const response = {
            message,
            data,
            success,
            toolUsed,
            suggestions,
            metadata: {
                responseTime: Date.now() - startTime,
                cached: false,
            },
        };
        this.addToHistory(message, JSON.stringify(response), toolUsed, success);
        return response;
    }
    /**
     * Persist a chat turn into history
     */
    addToHistory(input, output, toolUsed, success) {
        this.chatHistory.push({
            input,
            output,
            timestamp: new Date(),
            toolUsed,
            success,
        });
        this.saveMemory();
    }
    /**
     * Utility to determine if a tool result is effectively empty
     */
    isEmptyResult(result) {
        const d = result?.data;
        if (d == null)
            return true;
        if (Array.isArray(d))
            return d.length === 0;
        if (typeof d === "object") {
            if (Array.isArray(d.data) && d.data.length === 0)
                return true;
            if (typeof d.count === "number" && d.count === 0)
                return true;
        }
        return false;
    }
    /**
     * Friendly message templates for empty results
     */
    emptyMessage(tool) {
        const map = {
            get_messages_tool: "📭 Your inbox is empty! No conversations yet.",
            get_user_messages_tool: "💬 No recent conversations found.",
            get_matched_gigs_tool: "🔍 I couldn't find matching gigs right now. Want me to suggest profile improvements?",
            get_recommended_gigs_tool: "💡 No recommendations available yet. Let's optimize your profile first!",
            get_saved_gigs_tool: "⭐ You haven't saved any gigs yet. Start exploring!",
            get_saved_cover_letters_tool: "📝 No saved cover letters yet. Want to create one?",
            track_gig_applications_tool: "📊 You haven't applied to any gigs yet. Ready to start?",
            get_profile_details_tool: "👤 Couldn't load profile. Let's try again.",
            get_profile_analytics_tool: "📈 No analytics data available yet.",
        };
        return map[tool] || "🤔 Nothing found. Want to try something else?";
    }
    async explainError(tool, error) {
        try {
            const prompt = prompts_1.ChatPromptTemplate.fromTemplate("You are a helpful assistant. Explain this error in ONE friendly sentence and suggest ONE action. Tool: {tool}. Error: {error}.");
            const chain = runnables_1.RunnableSequence.from([
                prompt,
                this.model,
                new output_parsers_1.StringOutputParser(),
            ]);
            const msg = await chain.invoke({ tool, error });
            return (msg || "Sorry, I couldn’t complete that just now. Please try again in a moment.").trim();
        }
        catch {
            return "Sorry, I couldn’t complete that just now. Please try again in a moment.";
        }
    }
}
exports.ConnectaAgent = ConnectaAgent;

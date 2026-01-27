import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from 'dotenv';
import SystemSettings from '../models/SystemSettings.model.js';

dotenv.config();

class LLMService {

    private async getModel(): Promise<ChatGoogleGenerativeAI | null> {
        try {
            const settings = await SystemSettings.getSettings();
            const apiKey = settings.ai.geminiApiKey || process.env.GEMINI_API_KEY;

            if (!apiKey) {
                console.warn("⚠️ GEMINI_API_KEY is missing in System Settings and Environment.");
                return null;
            }

            return new ChatGoogleGenerativeAI({
                apiKey: apiKey,
                model: settings.ai.model || "gemini-2.0-flash",
                maxOutputTokens: 2048,
                temperature: 0.7,
                maxRetries: 1,
            });
        } catch (error) {
            console.error("Error fetching system settings for LLM:", error);
            return null;
        }
    }

    /**
     * Scopes a project idea into structured roles, budget, and timeline.
     */
    async scopeProject(description: string): Promise<any> {
        try {
            const model = await this.getModel();

            if (!model) {
                console.warn("LLM Model not available, using fallback.");
                return this.getFallbackScope(description);
            }

            const prompt = ChatPromptTemplate.fromMessages([
                ["system", `You are a Senior Project Architect. Scope the software project based on the user's input.

### 📋 REQUIREMENTS CATEGORIES
1. **TEAM STRUCTURE**: Define roles (title, description, budget, skills, count).
2. **BUDGET**: Market-realistic estimate in USD.
3. **TIMELINE**: Phased roadmap with action-oriented milestones.
4. **TECH STACK**: Modern, suitable tools matching the roles.

### 📋 OUTPUT SCHEMA (STRICT JSON)
{{
    "roles": [{{ "title": "...", "description": "...", "budget": 0, "skills": [], "count": 1 }}],
    "totalEstimatedBudget": 0,
    "timeline": "...",
    "milestones": [{{ "title": "...", "description": "...", "duration": "...", "deliverables": [] }}],
    "recommendedStack": [],
    "risks": []
}}

Return ONLY raw JSON. No markdown.`],
                ["human", "{description}"]
            ]);

            const chain = prompt.pipe(model).pipe(new StringOutputParser());
            const response = await chain.invoke({ description });

            // robust JSON parsing
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleanedResponse);
            } catch (e) {
                // Try to salvage if truncated
                const lastBrace = cleanedResponse.lastIndexOf('}');
                if (lastBrace > 0) {
                    return JSON.parse(cleanedResponse.substring(0, lastBrace + 1));
                }
                throw e;
            }

        } catch (error) {
            console.error("LLM Scoping Error:", error);
            return this.getFallbackScope(description);
        }
    }

    public getFallbackScope(description: string) {
        const lowerDesc = description.toLowerCase();
        let estimatedBudget = 2000;
        let timeline = "4 weeks";

        // Simple heuristic for budget
        if (lowerDesc.includes('app') || lowerDesc.includes('mobile') || lowerDesc.includes('ios') || lowerDesc.includes('android')) {
            estimatedBudget = 4500;
            timeline = "6 weeks";
        } else if (lowerDesc.includes('web') || lowerDesc.includes('platform') || lowerDesc.includes('saas') || lowerDesc.includes('dashboard')) {
            estimatedBudget = 3800;
            timeline = "5 weeks";
        }

        // Return empty roles as requested by user if AI fails
        return {
            roles: [],
            totalEstimatedBudget: estimatedBudget,
            timeline: timeline,
            milestones: [],
            recommendedStack: [],
            risks: []
        };
    }
    /**
     * Generates a personalized cover letter.
     */
    async generateCoverLetter(jobTitle: string, jobDescription: string, freelancerName: string, freelancerSkills: string[], freelancerBio: string): Promise<string> {
        try {
            const model = await this.getModel();

            if (!model) {
                return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position. With my background in ${freelancerSkills[0] || 'software development'}, I am confident I can contribute effectively to your project.\n\nThank you for considering my application.\n\nSincerely,\n${freelancerName}`;
            }

            const prompt = ChatPromptTemplate.fromMessages([
                ["system", `You are a Professional Career Coach. Write a concise, personalized cover letter.

### 📋 REQUIREMENTS
1. **TONE**: Professional, enthusiastic, and confident.
2. **CONTENT**: Match freelancer's bio/skills to the job description.
3. **LENGTH**: Under 200 words.
4. **FORMAT**: Standard professional letter format.

### 👤 FREELANCER
- Name: {freelancerName}
- Bio: {freelancerBio}
- Skills: {freelancerSkills}

### 💼 JOB
- Title: {jobTitle}
- Description: {jobDescription}

Output ONLY the raw cover letter text.`],
                ["human", "Write the cover letter."]
            ]);

            const chain = prompt.pipe(model).pipe(new StringOutputParser());
            const response = await chain.invoke({
                freelancerName,
                freelancerBio,
                freelancerSkills: freelancerSkills.join(', '),
                jobTitle,
                jobDescription
            });

            return response.trim();
        } catch (error) {
            console.error("LLM Cover Letter Error:", error);
            return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position. With my background in ${freelancerSkills[0] || 'software development'}, I am confident I can contribute effectively to your project.\n\nThank you for considering my application.\n\nSincerely,\n${freelancerName}`;
        }
    }
}

export default new LLMService();

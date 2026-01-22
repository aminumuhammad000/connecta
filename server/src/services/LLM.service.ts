import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from 'dotenv';

dotenv.config();

class LLMService {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ GEMINI_API_KEY is missing. LLM features will fail.");
        }

        this.model = new ChatGoogleGenerativeAI({
            apiKey: apiKey,
            model: "gemini-1.5-flash",
            maxOutputTokens: 2048,
            temperature: 0.7,
        });
    }

    /**
     * Scopes a project idea into structured roles, budget, and timeline.
     */
    async scopeProject(description: string): Promise<any> {
        try {
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", `You are an expert Senior Project Manager and CTO.
                Your goal is to actively scope a software project based on a high-level description. You must output a STRICT JSON object.

                Analyze the user's request and generate:
                1. A comprehensive team structure (Roles).
                2. A realistic budget estimate (in USD).
                3. A phased delivery timeline.
                4. A suitable modern tech stack.

                Output JSON Structure:
                {{
                    "roles": [
                        {{
                            "title": "e.g. Senior Backend Engineer",
                            "description": "Specific responsibilities for this project.",
                            "budget": 1500,
                            "skills": ["Node.js", "TypeScript", "PostgreSQL"],
                            "count": 1
                        }}
                    ],
                    "totalEstimatedBudget": 5000,
                    "timeline": "e.g. 6 weeks",
                    "milestones": [
                        {{ 
                            "title": "Phase 1: MVP Core", 
                            "description": "Implementation of user auth and database setup.", 
                            "duration": "2 weeks",
                            "deliverables": ["API Documentation", "User Login Flow"] 
                        }}
                    ],
                    "recommendedStack": ["React Native", "NestJS", "MongoDB"],
                    "risks": ["Potential integration complexity with 3rd party APIs"]
                }}

                Constraints:
                - Roles must match the recommended stack (e.g. if React is chosen, include a Frontend Dev with React skills).
                - milestone titles should be action-oriented.
                - budget should be market-realistic for a freelance team.
                - Return ONLY raw JSON. No markdown formatting.
                `],
                ["human", "{description}"]
            ]);

            const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
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
            // Fallback to basic structure on error to prevent crashing
            return {
                roles: [
                    { title: "Full Stack Developer", description: "Core development", budget: 1000, skills: ["JavaScript"], count: 1 }
                ],
                totalEstimatedBudget: 1000,
                timeline: "4 weeks"
            };
        }
    }
    /**
     * Generates a personalized cover letter.
     */
    async generateCoverLetter(jobTitle: string, jobDescription: string, freelancerName: string, freelancerSkills: string[], freelancerBio: string): Promise<string> {
        try {
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", `You are an expert career coach and professional copywriter.
                Your goal is to write a compelling, professional, and personalized cover letter for a freelancer applying to a job.
                
                The cover letter should:
                1. Addressed to the Hiring Manager (or specific name if known).
                2. Highlight relevant skills matching the job description.
                3. Be enthusiastic but professional.
                4. keep it concise (under 250 words).
                
                Freelancer Profile:
                - Name: {freelancerName}
                - Bio: {freelancerBio}
                - Skills: {freelancerSkills}
                
                Job Details:
                - Title: {jobTitle}
                - Description: {jobDescription}
                
                Output ONLY the raw cover letter text. No markdown blocks, no "Here is your cover letter:".
                `],
                ["human", "Write the cover letter."]
            ]);

            const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
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

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
import SystemSettings from '../models/SystemSettings.model.js';
dotenv.config();
class LLMService {
    async getModel() {
        try {
            const settings = await SystemSettings.getSettings();
            const apiKey = settings.ai.geminiApiKey || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.warn("⚠️ GEMINI_API_KEY is missing in System Settings and Environment.");
                return null;
            }
            return new ChatGoogleGenerativeAI({
                apiKey: apiKey,
                model: settings.ai.model || "gemini-2.5-flash",
                maxOutputTokens: 8192,
                temperature: 0.7,
                maxRetries: 1,
            });
        }
        catch (error) {
            console.error("Error fetching system settings for LLM:", error);
            return null;
        }
    }
    /**
     * Scopes a project idea into structured roles, budget, and timeline.
     */
    async scopeProject(description) {
        try {
            const model = await this.getModel();
            if (!model) {
                console.warn("LLM Model not available, using fallback.");
                return this.getFallbackScope(description);
            }
            const promptText = `You are a Senior Project Architect. Scope the software project based on the user's input.

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

Return ONLY raw JSON. No markdown.

USER DESCRIPTION: ${description}`;
            const response = await model.invoke([new HumanMessage(promptText)]);
            const responseText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
            // robust JSON parsing
            const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleanedResponse);
            }
            catch (e) {
                // Try to salvage if truncated
                const lastBrace = cleanedResponse.lastIndexOf('}');
                if (lastBrace > 0) {
                    return JSON.parse(cleanedResponse.substring(0, lastBrace + 1));
                }
                throw e;
            }
        }
        catch (error) {
            console.error("LLM Scoping Error:", error);
            return this.getFallbackScope(description);
        }
    }
    getFallbackScope(description) {
        const lowerDesc = description.toLowerCase();
        let estimatedBudget = 2000;
        let timeline = "4 weeks";
        // Simple heuristic for budget
        if (lowerDesc.includes('app') || lowerDesc.includes('mobile') || lowerDesc.includes('ios') || lowerDesc.includes('android')) {
            estimatedBudget = 4500;
            timeline = "6 weeks";
        }
        else if (lowerDesc.includes('web') || lowerDesc.includes('platform') || lowerDesc.includes('saas') || lowerDesc.includes('dashboard')) {
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
    async generateCoverLetter(jobTitle, jobDescription, freelancerName, freelancerSkills, freelancerBio) {
        try {
            const model = await this.getModel();
            if (!model) {
                return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position. With my background in ${freelancerSkills[0] || 'software development'}, I am confident I can contribute effectively to your project.\n\nThank you for considering my application.\n\nSincerely,\n${freelancerName}`;
            }
            const promptText = `You are a Professional Career Coach. Write a concise, personalized cover letter.

### 📋 REQUIREMENTS
1. **TONE**: Professional, enthusiastic, and confident.
2. **CONTENT**: Match freelancer's bio/skills to the job description.
3. **LENGTH**: Under 200 words.
4. **FORMAT**: Standard professional letter format.

### 👤 FREELANCER
- Name: ${freelancerName}
- Bio: ${freelancerBio}
- Skills: ${freelancerSkills.join(', ')}

### 💼 JOB
- Title: ${jobTitle}
- Description: ${jobDescription}

Output ONLY the raw cover letter text.`;
            const response = await model.invoke([new HumanMessage(promptText)]);
            return (typeof response.content === 'string' ? response.content : JSON.stringify(response.content)).trim();
        }
        catch (error) {
            console.error("LLM Cover Letter Error:", error);
            return `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position. With my background in ${freelancerSkills[0] || 'software development'}, I am confident I can contribute effectively to your project.\n\nThank you for considering my application.\n\nSincerely,\n${freelancerName}`;
        }
    }
    /**
     * Parses resume text into structured profile data.
     */
    async parseResumeText(text) {
        try {
            const model = await this.getModel();
            if (!model) {
                throw new Error("AI Model not available");
            }
            const promptText = `You are an expert HR Data Extractor. Extract ALL profile information from the resume text below.
                
### 📋 OUTPUT SCHEMA (STRICT JSON)
{{
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "jobTitle": "...",
    "bio": "Professional summary (30-50 words)...",
    "skills": ["skill1", "skill2"...],
    "education": [
        {{ "institution": "...", "degree": "...", "fieldOfStudy": "...", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD or Present" }}
    ],
    "employment": [
        {{ "company": "...", "title": "...", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD or Present", "description": "Detailed description of responsibilities..." }}
    ]
}}

- Extract ALL education and employment history found. Do not summarize or truncate.
- Limit "skills" to the TOP 30 most relevant tech skills to save space.
- Use "YYYY-MM-01" for dates if day is unknown.
- Returns "Present" for current roles.
- If specific fields are missing, omit them.
- Return ONLY raw minified JSON. No Markdown.

RESUME TEXT:
${text}`;
            console.log('🤖 Sending ParseResume prompt...');
            const response = await model.invoke([new HumanMessage(promptText)]);
            const responseText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
            // robust JSON parsing
            let cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log('🤖 AI Raw Response:', cleanedResponse.substring(0, 500) + '...'); // Log start of response
            console.log('🤖 AI Response Length:', cleanedResponse.length);
            try {
                return JSON.parse(cleanedResponse);
            }
            catch (e) {
                console.warn("JSON Parse failed, attempting repair...");
                const repaired = this.repairJSON(cleanedResponse);
                try {
                    return JSON.parse(repaired);
                }
                catch (e2) {
                    console.error("Failed to parse repaired JSON", repaired);
                    throw new Error("Failed to parse resume data");
                }
            }
        }
        catch (error) {
            console.error("LLM Resume Parse Error:", error);
            // Check for quota/rate limit errors and return fallback mock data
            if (error?.message?.includes('429') || error?.message?.includes('Quota') || error?.message?.includes('Too Many Requests')) {
                console.warn("⚠️ AI Quota Exceeded. Returning Mock Data for demonstration.");
                return this.getMockResumeData(text);
            }
            throw error;
        }
    }
    repairJSON(jsonStr) {
        try {
            // Remove markdown code blocks if present (redundant safety)
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            // Simple stack to keep track of open brackets/braces
            const stack = [];
            let inString = false;
            let escaped = false;
            for (let i = 0; i < jsonStr.length; i++) {
                const char = jsonStr[i];
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (char === '\\') {
                    escaped = true;
                    continue;
                }
                if (char === '"') {
                    inString = !inString;
                    continue;
                }
                if (!inString) {
                    if (char === '{')
                        stack.push('}');
                    else if (char === '[')
                        stack.push(']');
                    else if (char === '}' || char === ']') {
                        if (stack.length && stack[stack.length - 1] === char) {
                            stack.pop();
                        }
                    }
                }
            }
            // Close any open strings first
            if (inString)
                jsonStr += '"';
            // Remove trailing commas which are common in truncation
            jsonStr = jsonStr.trim();
            if (jsonStr.endsWith(',')) {
                jsonStr = jsonStr.slice(0, -1);
            }
            // If it ends with a colon (e.g. "key":), append null
            if (jsonStr.endsWith(':')) {
                jsonStr += ' null';
            }
            // Heuristic for cutoff keys
            if (jsonStr.endsWith('"') && stack.length > 0 && stack[stack.length - 1] === '}') {
                // Check if it looks like a key (not a value in a list or after a colon)
                if (!/:\s*"[^"]*"$/.test(jsonStr) && !/,\s*"[^"]*"$/.test(jsonStr)) {
                    // This is a loose check, but appending : null is safer than failing
                    // Actually, if it ends with " and prev char was , or { it is a key
                    if (/[,{]\s*"[^"]*"$/.test(jsonStr)) {
                        jsonStr += ': null';
                    }
                }
            }
            // Append missing closing brackets in reverse order
            while (stack.length > 0) {
                jsonStr += stack.pop();
            }
            return jsonStr;
        }
        catch (e) {
            return jsonStr; // Return original if repair crashes (unlikely)
        }
    }
    getMockResumeData(text) {
        // Basic fallback extraction or static mock
        return {
            firstName: "Test",
            lastName: "Candidate",
            email: "extracted@example.com",
            phone: "+1234567890",
            location: "San Francisco, CA",
            jobTitle: "Software Engineer",
            bio: "Experienced developer with a fallback mock profile due to AI rate limits. Ready to build amazing things.",
            skills: ["JavaScript", "TypeScript", "React", "Node.js", "AI Handling"],
            education: [
                { institution: "Connecta University", degree: "Bachelor's", fieldOfStudy: "Computer Science", startDate: "2018-09-01", endDate: "2022-05-01" }
            ],
            employment: [
                { company: "Tech Startup", title: "Senior Developer", startDate: "2022-06-01", endDate: "2024-01-01", description: "Led development of scalable web applications." }
            ]
        };
    }
    async generateProjectTasks(projectDetails) {
        try {
            const model = await this.getModel();
            if (!model)
                return [];
            const rolesText = projectDetails.roles?.map((r) => `- ${r.title}: ${r.description}`).join('\n');
            const promptText = `You are a Project Manager. Generate a set of high-level tasks for a team-based project.
            
### PROJECT DETAILS
- Title: ${projectDetails.title}
- Description: ${projectDetails.description}

### ROLES
${rolesText}

### OUTPUT SCHEMA (STRICT JSON ARRAY)
[
    {
        "title": "...",
        "description": "...",
        "priority": "low/medium/high",
        "roleTitle": "Title of the role best suited for this task"
    }
]

Return ONLY raw JSON array. Generate exactly 5-8 core tasks.`;
            const response = await model.invoke([new HumanMessage(promptText)]);
            const responseText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
            const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedResponse);
        }
        catch (error) {
            console.error("LLM Auto-Task Error:", error);
            return [];
        }
    }
}
export default new LLMService();

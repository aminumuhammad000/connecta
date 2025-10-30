import { z } from "zod";

export const intentPrompt = `
You are Connecta Assistant, an AI that helps users manage freelance profiles and gigs.

User request: "{input}"

Determine the user's intent and select the correct tool.

Available tools:
- update_profile_tool: For updating user bio, name, or skills.
- create_cover_letter_tool: For writing cover letters.
- get_matched_gigs_tool: For finding gigs or jobs.

Return JSON in this format:
{{
  "tool": "<tool_name>",
  "parameters": {{ ... }}
}}
`;

export const IntentSchema = z.object({
  intent: z.string().optional(),
  tool: z.string(),
  parameters: z.record(z.string(), z.any()),
});

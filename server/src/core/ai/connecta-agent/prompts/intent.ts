import { z } from 'zod';

export const IntentSchema = z.object({
  intent: z.string(),
  tool: z.enum([
    'update_profile_tool',
    'create_cover_letter_tool',
    'get_matched_gigs_tool',
    'count_user_projects_tool',
    'update_cv_tool'
  ]),
  parameters: z.record(z.any(), z.any())
});

export type IntentResponse = z.infer<typeof IntentSchema>;

export const intentPrompt = `You are Connecta Assistant, an AI agent that helps users manage their freelance profiles and gigs.
User request: "{input}"

Decide the intent and which tool to use from the following list:
- update_profile_tool: for updating bio, name, skills, etc.
- create_cover_letter_tool: for writing cover or application letters.
- get_matched_gigs_tool: for finding suitable gigs or jobs.
- count_user_projects_tool: for checking number of completed projects.
- update_cv_tool: for updating or uploading CV files.

Return your response in JSON:
{
  "intent": "...",
  "tool": "...",
  "parameters": {...}
}`;

export const parseIntentResponse = (response: string): IntentResponse => {
  try {
    const parsed = JSON.parse(response);
    return IntentSchema.parse(parsed);
  } catch (error) {
    throw new Error('Failed to parse intent response: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

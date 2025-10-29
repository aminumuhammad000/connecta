import axios from "axios";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const schema = z.object({
  bio: z.string().optional(),
  name: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

type ProfileUpdateParams = z.infer<typeof schema>;

export class UpdateProfileTool extends StructuredTool<typeof schema> {
  name = "update_profile_tool";
  description = "Updates a user's profile bio, name, or skills via the backend API.";
  schema = z.object({
    bio: z.string().optional(),
    name: z.string().optional(),
    skills: z.array(z.string()).optional(),
  });

  constructor(private apiBaseUrl: string, private authToken: string) {
    super();
  }

  async _call(params: ProfileUpdateParams): Promise<string> {
    try {
      const res = await axios.post(
        `${this.apiBaseUrl}/user/update`,
        params,
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );
      return JSON.stringify(res.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw new Error('Failed to update profile: Unknown error occurred');
    }
  }
}

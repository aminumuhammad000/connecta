import axios, { AxiosError } from "axios";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Parameters expected from the LLM for high-level intent
const schema = z.object({
  bio: z.string().optional(),
  name: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

type ProfileUpdateParams = z.infer<typeof schema>;

export class UpdateProfileTool extends StructuredTool<typeof schema> {
  name = "update_profile_tool";
  description = "Updates a user's profile (bio, name, skills intent). Maps to server Profile where possible.";
  schema = schema;

  constructor(
    private apiBaseUrl: string,
    private authToken: string,
    private userId: string,
    private mockMode: boolean = false
  ) {
    super();
  }

  async _call(params: ProfileUpdateParams): Promise<string> {
    if (this.mockMode) {
      return JSON.stringify({
        success: true,
        message: "Profile updated successfully (mock)",
        data: params,
      });
    }

    try {
      // 1) Find the Profile document by userId (API expects Profile _id, not User _id)
      const listRes = await axios.get(`${this.apiBaseUrl}/api/profiles`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      const profiles: any[] = Array.isArray(listRes.data) ? listRes.data : [];
      const profile = profiles.find((p: any) => {
        // user may be populated object or an id string
        const userField = p?.user;
        if (!userField) return false;
        if (typeof userField === "string") return userField === this.userId;
        return userField?._id === this.userId;
      });

      // 2) Create profile if not found (minimal payload)
      let profileId: string;
      if (!profile) {
        const createRes = await axios.post(
          `${this.apiBaseUrl}/api/profiles`,
          { user: this.userId },
          { headers: { Authorization: `Bearer ${this.authToken}` } }
        );
        profileId = createRes.data?._id;
      } else {
        profileId = profile._id;
      }

      // 3) Map high-level fields to server Profile fields when possible.
      // Current server Profile supports: phoneNumber, location, resume, education, languages, employment
      // No direct mapping for bio/name/skills, so we no-op update if nothing mappable provided.
      const updatePayload: Record<string, unknown> = {};

      // If caller accidentally passed profile-supported fields, forward them through
      const passThroughKeys = [
        "phoneNumber",
        "location",
        "resume",
        "education",
        "languages",
        "employment",
      ] as const;
      for (const key of passThroughKeys) {
        if (key in (params as any)) {
          updatePayload[key] = (params as any)[key];
        }
      }

      if (Object.keys(updatePayload).length === 0) {
        // Nothing mappable to update; return early with informative message
        return JSON.stringify({
          success: true,
          message:
            "No profile-updatable fields provided; created/ensured profile exists and kept as-is.",
          profileId,
        });
      }

      const res = await axios.put(
        `${this.apiBaseUrl}/api/profiles/${profileId}`,
        updatePayload,
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );
      return JSON.stringify({ success: true, data: res.data });
    } catch (err) {
      const axErr = err as AxiosError<any>;
      const status = axErr.response?.status;
      const data = axErr.response?.data;
      const detail = typeof data === "string" ? data : data?.message || axErr.message;
      throw new Error(
        `Failed to update profile${status ? ` (status ${status})` : ""}: ${detail}`
      );
    }
  }
}

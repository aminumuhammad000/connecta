import { BaseTool } from "./base.tool";

export class GetProfileDetailsTool extends BaseTool {
  name = "get_profile_details_tool";
  description = "Fetch user profile details by profile ID or by associated user ID.";

  async _call(params: Record<string, any>) {
    const profileId = params.profileId;
    const userId = params.userId || this.userId;

    if (profileId) {
      return this.request(`/api/profiles/${profileId}`, "GET");
    }

    // Fallback: find profile by userId by listing and filtering client-side
    const listRes = await this.request(`/api/profiles`, "GET");
    if (!listRes.success) return listRes;

    const profiles = Array.isArray(listRes.data) ? listRes.data : [];
    const profile = profiles.find((p: any) => {
      const uid = p?.user?._id || p?.user || p?.userId;
      return uid == userId; // loose equality to handle string/ObjectId serialization
    });

    if (!profile) {
      return { success: false, message: "Profile not found for user" };
    }

    return { success: true, data: profile };
  }
}

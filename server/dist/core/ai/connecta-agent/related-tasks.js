"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RELATED_TASKS_MAP = void 0;
exports.getRelatedTasks = getRelatedTasks;
exports.formatRelatedTasks = formatRelatedTasks;
exports.getQuickActions = getQuickActions;
/**
 * Related Tasks Mapping
 * Maps each tool to contextual suggestions for what users can do next
 */
exports.RELATED_TASKS_MAP = {
    // Profile Tools
    get_profile_details_tool: [
        "✏️ Update your profile",
        "📊 Check profile analytics",
        "💪 Analyze profile strength",
    ],
    update_profile_tool: [
        "👀 View your updated profile",
        "📊 Check profile analytics",
        "📁 Add portfolio items",
    ],
    analyze_profile_strength_tool: [
        "✏️ Update your profile",
        "💡 Get improvement suggestions",
        "👀 View your profile",
    ],
    suggest_profile_improvements_tool: [
        "✏️ Update your profile now",
        "📊 Check profile analytics",
        "👀 View current profile",
    ],
    get_profile_analytics_tool: [
        "✏️ Update your profile",
        "💪 Analyze profile strength",
        "🔍 Find matching gigs",
    ],
    // Gig Discovery Tools
    get_matched_gigs_tool: [
        "⭐ Save interesting gigs",
        "📝 Create a cover letter",
        "👀 View your saved gigs",
    ],
    get_recommended_gigs_tool: [
        "⭐ Save recommended gigs",
        "🔍 Search with different skills",
        "📝 Create a cover letter",
    ],
    get_saved_gigs_tool: [
        "📝 Create cover letter for saved gig",
        "🔍 Find more matching gigs",
        "📊 Track your applications",
    ],
    save_gig_tool: [
        "👀 View all saved gigs",
        "📝 Create a cover letter",
        "🔍 Find more similar gigs",
    ],
    // Cover Letter Tools
    create_cover_letter_tool: [
        "💾 Save this cover letter",
        "📤 Apply to the gig",
        "🔍 Find more matching gigs",
    ],
    get_saved_cover_letters_tool: [
        "📝 Create a new cover letter",
        "🔍 Find matching gigs",
        "📊 Track applications",
    ],
    edit_cover_letter_tool: [
        "💾 Save edited letter",
        "📤 Apply to gig",
        "👀 View saved letters",
    ],
    save_cover_letter_tool: [
        "👀 View all saved letters",
        "📝 Create another letter",
        "📊 Track applications",
    ],
    // Application Tools
    track_gig_applications_tool: [
        "🔍 Find more matching gigs",
        "📝 Create cover letters",
        "👀 View saved gigs",
    ],
    apply_to_gig_tool: [
        "📊 Track this application",
        "🔍 Find similar gigs",
        "📝 Create another cover letter",
    ],
    // Communication Tools
    get_messages_tool: [
        "💬 Send a message",
        "🔍 Find matching gigs",
        "👀 View your profile",
    ],
    send_message_tool: [
        "📬 Check your messages",
        "🔍 Find matching gigs",
    ],
    get_user_messages_tool: [
        "💬 Send a reply",
        "📬 Check all messages",
    ],
    // Support Tools
    get_help_tool: [
        "👀 View your profile",
        "🔍 Find matching gigs",
        "📞 Contact support",
    ],
    get_support_tool: [
        "❓ Get help with features",
        "👀 View your profile",
        "🔍 Find matching gigs",
    ],
    explain_feature_tool: [
        "❓ Get more help",
        "👀 Try the feature",
        "📞 Contact support if needed",
    ],
    // Default fallback
    default: [
        "👀 View your profile",
        "🔍 Find matching gigs",
        "❓ Get help",
    ],
};
/**
 * Get related tasks for a given tool
 * @param toolName - The name of the tool that was just executed
 * @param context - Optional context to provide more specific suggestions
 * @returns Array of related task suggestions
 */
function getRelatedTasks(toolName, context) {
    // Get suggestions for this tool, or use default
    const suggestions = exports.RELATED_TASKS_MAP[toolName] || exports.RELATED_TASKS_MAP.default;
    // Could add more intelligent filtering based on context here
    // For example, if user just saved a gig, don't suggest saving again
    return suggestions.slice(0, 3); // Return top 3 suggestions
}
/**
 * Format related tasks as a message string
 * @param tasks - Array of task suggestions
 * @returns Formatted string
 */
function formatRelatedTasks(tasks) {
    if (!tasks || tasks.length === 0)
        return "";
    return `\n\n**You can also:**\n${tasks.join("\n")}`;
}
/**
 * Get quick action buttons for related tasks
 * @param toolName - The name of the tool
 * @returns Array of quick action objects
 */
function getQuickActions(toolName) {
    const actionMap = {
        get_profile_details_tool: [
            { text: "Update Profile", action: "update_profile" },
            { text: "View Analytics", action: "profile_analytics" },
        ],
        get_matched_gigs_tool: [
            { text: "Save Gig", action: "save_gig" },
            { text: "Create Cover Letter", action: "create_cover_letter" },
        ],
        create_cover_letter_tool: [
            { text: "Save Letter", action: "save_letter" },
            { text: "Find More Gigs", action: "find_gigs" },
        ],
    };
    return actionMap[toolName] || [];
}

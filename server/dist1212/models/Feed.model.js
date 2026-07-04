import mongoose, { Schema } from 'mongoose';
const FeedReactionsSchema = new Schema({
    celebrate: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    insightful: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    clap: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    fire: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    love: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
}, { _id: false });
const FeedPostSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'project_completed', 'job_posted', 'proposal_accepted',
            'review_received', 'new_member', 'identity_verified',
            'portfolio_added', 'milestone_hit', 'first_hire',
            'proposal_submitted',
            'platform_win', 'daily_tip', 'leaderboard_update',
            'community_poll', 'job_trending', 'user_post',
        ],
        index: true,
    },
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorName: { type: String },
    actorAvatar: { type: String },
    actorRole: { type: String },
    actorLocation: { type: String },
    title: { type: String, required: true },
    body: { type: String, required: true },
    emoji: { type: String, default: '📢' },
    imageUrl: { type: String },
    relatedType: { type: String, enum: ['job', 'project', 'proposal', 'review', 'user'] },
    relatedId: { type: Schema.Types.ObjectId },
    targetAudience: { type: String, enum: ['all', 'freelancers', 'clients'], default: 'all' },
    visibility: { type: String, enum: ['public', 'followers'], default: 'public' },
    reactions: { type: FeedReactionsSchema, default: () => ({ celebrate: [], insightful: [], clap: [], fire: [], love: [] }) },
    commentCount: { type: Number, default: 0 },
    poll: {
        question: String,
        options: [
            {
                text: String,
                votes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
            },
        ],
        closesAt: Date,
    },
    isPinned: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isSystemPost: { type: Boolean, default: false },
    expiresAt: { type: Date },
}, { timestamps: true });
// Compound indexes for efficient queries
FeedPostSchema.index({ createdAt: -1 });
FeedPostSchema.index({ visibility: 1, createdAt: -1 });
FeedPostSchema.index({ targetAudience: 1, createdAt: -1 });
FeedPostSchema.index({ isTrending: 1, createdAt: -1 });
FeedPostSchema.index({ isPinned: 1, createdAt: -1 });
const FeedPost = mongoose.model('FeedPost', FeedPostSchema);
export default FeedPost;

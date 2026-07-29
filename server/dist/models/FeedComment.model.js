import mongoose, { Schema } from 'mongoose';
const FeedCommentSchema = new Schema({
    feedPostId: { type: Schema.Types.ObjectId, ref: 'FeedPost', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    text: { type: String, required: true, maxlength: 500 },
    mentions: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });
FeedCommentSchema.index({ feedPostId: 1, createdAt: 1 });
const FeedComment = mongoose.model('FeedComment', FeedCommentSchema);
export default FeedComment;

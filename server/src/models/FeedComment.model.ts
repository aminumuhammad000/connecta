import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedComment extends Document {
  feedPostId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  text: string;
  mentions: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedCommentSchema = new Schema<IFeedComment>(
  {
    feedPostId:    { type: Schema.Types.ObjectId, ref: 'FeedPost', required: true, index: true },
    authorId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName:    { type: String, required: true },
    authorAvatar:  { type: String },
    text:          { type: String, required: true, maxlength: 500 },
    mentions:      { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likes:         { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

FeedCommentSchema.index({ feedPostId: 1, createdAt: 1 });

const FeedComment = mongoose.model<IFeedComment>('FeedComment', FeedCommentSchema);
export default FeedComment;

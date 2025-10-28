import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt: Date;
  unreadCount: {
    [userId: string]: number;
  };
  projectId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);

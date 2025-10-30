import mongoose, { Document, Schema } from 'mongoose';


export interface IConversation extends Document {
  clientId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt: Date;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}


const ConversationSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
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
  },
  {
    timestamps: true,
  }
);


// Unique index for privacy: one conversation per client, freelancer, and project
ConversationSchema.index({ clientId: 1, freelancerId: 1, projectId: 1 }, { unique: true });
ConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);

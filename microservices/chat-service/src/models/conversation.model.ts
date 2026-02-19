
import mongoose, { Schema, Document } from 'mongoose';

interface IConversation extends Document {
    participants: string[];
    lastMessage?: string;
    isArchived: boolean;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
    {
        participants: [{ type: String, required: true }],
        lastMessage: { type: String },
        isArchived: { type: Boolean, default: false },
        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

// Index to quickly find conversations for a user
ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

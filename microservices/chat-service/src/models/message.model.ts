import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
    conversationId: string;
    senderId: string;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    isEdited: boolean;
    editedAt?: Date;
    deletedAt?: Date;
    attachments: string[];
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        senderId: { type: String, required: true },
        content: { type: String, required: true },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file', 'system'],
            default: 'text'
        },
        isEdited: { type: Boolean, default: false },
        editedAt: { type: Date },
        deletedAt: { type: Date },
        attachments: [{ type: String }],
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);

import mongoose, { Schema } from 'mongoose';
const MessageSchema = new Schema({
    conversationId: {
        type: String,
        required: true,
        index: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    attachments: [
        {
            fileName: String,
            fileUrl: String,
            fileType: String,
        },
    ],
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Index for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
export default mongoose.model('Message', MessageSchema);

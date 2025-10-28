import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);

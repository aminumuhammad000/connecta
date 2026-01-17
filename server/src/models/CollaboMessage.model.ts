import mongoose, { Schema, Document } from "mongoose";

export interface ICollaboMessage extends Document {
    workspaceId: mongoose.Types.ObjectId;
    channelName: string;
    senderId: mongoose.Types.ObjectId; // User ID
    senderRole: string; // e.g., "Frontend Developer"
    content: string;
    attachments: string[];
    createdAt: Date;
}

const CollaboMessageSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: "CollaboWorkspace", required: true },
        channelName: { type: String, required: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        senderRole: { type: String, required: true },
        content: { type: String, required: true },
        attachments: [{ type: String }],
    },
    { timestamps: true }
);

export default mongoose.model<ICollaboMessage>("CollaboMessage", CollaboMessageSchema);

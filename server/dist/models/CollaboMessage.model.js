import mongoose, { Schema } from "mongoose";
const CollaboMessageSchema = new Schema({
    workspaceId: { type: Schema.Types.ObjectId, ref: "CollaboWorkspace", required: true },
    channelName: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
}, { timestamps: true });
export default mongoose.model("CollaboMessage", CollaboMessageSchema);

import mongoose, { Schema } from "mongoose";
const CollaboActivitySchema = new Schema({
    workspaceId: { type: Schema.Types.ObjectId, ref: "CollaboWorkspace", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
        type: String,
        required: true,
        enum: [
            'task_created', 'task_updated', 'task_deleted', 'task_status_changed',
            'file_uploaded', 'file_deleted',
            'role_added', 'role_updated', 'role_filled',
            'message_sent',
            'payment_confirmed',
            'member_joined', 'member_removed'
        ]
    },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });
// Index for fast retrieval of workspace activities
CollaboActivitySchema.index({ workspaceId: 1, createdAt: -1 });
export default mongoose.model("CollaboActivity", CollaboActivitySchema);

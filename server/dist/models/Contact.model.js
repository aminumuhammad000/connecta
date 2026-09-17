import mongoose, { Schema } from "mongoose";
const ContactSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, default: "General Support" },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    status: {
        type: String,
        enum: ['Submitted', 'In Progress', 'Reviewed', 'Resolved', 'new', 'read', 'archived'],
        default: 'Submitted'
    },
    adminResponse: { type: String, default: "" },
}, { timestamps: true });
export const Contact = mongoose.model("Contact", ContactSchema);

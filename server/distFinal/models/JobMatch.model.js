import mongoose, { Schema } from "mongoose";
const JobMatchSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    score: { type: Number, required: true },
    isEmailed: { type: Boolean, default: false },
    notificationFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'relevant_only'],
        required: true
    },
}, { timestamps: true });
// Index for efficient cleanup and batching
JobMatchSchema.index({ user: 1, isEmailed: 1, notificationFrequency: 1 });
JobMatchSchema.index({ createdAt: 1 });
const JobMatch = mongoose.model("JobMatch", JobMatchSchema);
export default JobMatch;

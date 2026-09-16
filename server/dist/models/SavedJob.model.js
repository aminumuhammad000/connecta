// src/models/SavedJob.model.ts
import mongoose, { Schema } from "mongoose";
const SavedJobSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
// Compound unique index so a user cannot save the same job twice
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
const SavedJob = mongoose.model("SavedJob", SavedJobSchema);
export default SavedJob;

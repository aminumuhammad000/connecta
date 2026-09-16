// src/models/SavedJob.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISavedJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJobSchema: Schema<ISavedJob> = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Compound unique index so a user cannot save the same job twice
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const SavedJob = mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);
export default SavedJob;

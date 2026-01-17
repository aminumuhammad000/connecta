import mongoose, { Schema, Document } from "mongoose";

export interface ICollaboFile extends Document {
    workspaceId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    name: string;
    type: string;
    size: number;
    url: string;
    createdAt: Date;
}

const CollaboFileSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: "CollaboWorkspace", required: true },
        uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICollaboFile>("CollaboFile", CollaboFileSchema);

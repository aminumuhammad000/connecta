import mongoose, { Schema } from "mongoose";
const CollaboFileSchema = new Schema({
    workspaceId: { type: Schema.Types.ObjectId, ref: "CollaboWorkspace", required: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
}, { timestamps: true });
export default mongoose.model("CollaboFile", CollaboFileSchema);

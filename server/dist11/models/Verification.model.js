import mongoose, { Schema } from "mongoose";
const VerificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    idType: {
        type: String,
        enum: ["national_id", "voters_card", "passport", "other"],
        required: true,
    },
    idNumber: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date },
    idFrontImage: { type: String, required: true },
    idBackImage: { type: String },
    selfieImage: { type: String },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    adminNotes: { type: String },
}, { timestamps: true });
const Verification = mongoose.model("Verification", VerificationSchema);
export default Verification;

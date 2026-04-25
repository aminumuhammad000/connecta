// src/models/Proposal.model.ts
import mongoose, { Schema } from 'mongoose';
const ProposalSchema = new Schema({
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: true,
    },
    deliveryTime: {
        type: Number,
        required: true,
    },
    freelancerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'rejected', 'withdrawn'],
        default: 'pending',
    },
}, {
    timestamps: true,
});
// Index for faster queries
ProposalSchema.index({ freelancerId: 1, status: 1 });
ProposalSchema.index({ jobId: 1 });
ProposalSchema.index({ createdAt: -1 });
export default mongoose.model('Proposal', ProposalSchema);

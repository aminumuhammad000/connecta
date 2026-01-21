import mongoose, { Schema } from 'mongoose';
const ProposalSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    recommended: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        required: true,
    },
    budget: {
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: '₦',
        },
    },
    dateRange: {
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    type: {
        type: String,
        enum: ['recommendation', 'referral'],
        required: true,
    },
    referredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    referredByName: {
        type: String,
    },
    freelancerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired', 'approved', 'withdrawn'],
        default: 'pending',
    },
    level: {
        type: String,
        enum: ['entry', 'intermediate', 'expert'],
        default: 'entry',
    },
    priceType: {
        type: String,
        enum: ['fixed', 'hourly'],
        default: 'fixed',
    },
    // New fields
    coverLetter: String,
    templateId: {
        type: Schema.Types.ObjectId,
        ref: 'ProposalTemplate',
    },
    isCustomized: {
        type: Boolean,
        default: false,
    },
    editHistory: [{
            editedAt: Date,
            changes: String,
        }],
    lastEditedAt: Date,
    withdrawnAt: Date,
    withdrawalReason: String,
    expiresAt: Date,
    counterOffers: [{
            amount: Number,
            message: String,
            offeredBy: {
                type: String,
                enum: ['client', 'freelancer'],
            },
            offeredAt: Date,
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending',
            },
        }],
    views: {
        type: Number,
        default: 0,
    },
    viewedBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
}, {
    timestamps: true,
});
// Index for faster queries
ProposalSchema.index({ freelancerId: 1, status: 1 });
ProposalSchema.index({ type: 1, freelancerId: 1 });
ProposalSchema.index({ createdAt: -1 });
ProposalSchema.index({ jobId: 1 });
ProposalSchema.index({ expiresAt: 1 });
export default mongoose.model('Proposal', ProposalSchema);

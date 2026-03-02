import mongoose, { Schema } from 'mongoose';
const SignatureSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    signedAt: {
        type: Date,
        default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
});
const ContractTermSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
});
const ContractSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    freelancerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    contractType: {
        type: String,
        enum: ['fixed_price', 'hourly', 'milestone'],
        required: true,
    },
    terms: [ContractTermSchema],
    customTerms: String,
    budget: {
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'NGN',
        },
        paymentSchedule: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    estimatedHours: Number,
    deliverables: [String],
    status: {
        type: String,
        enum: ['draft', 'pending_signatures', 'active', 'completed', 'terminated', 'disputed'],
        default: 'draft',
        index: true,
    },
    clientSignature: SignatureSchema,
    freelancerSignature: SignatureSchema,
    templateId: {
        type: Schema.Types.ObjectId,
        ref: 'ContractTemplate',
    },
    amendments: [{
            description: String,
            amendedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            amendedAt: Date,
            approved: Boolean,
        }],
    terminatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    terminationReason: String,
    terminatedAt: Date,
    disputeId: {
        type: Schema.Types.ObjectId,
        ref: 'Dispute',
    },
    version: {
        type: Number,
        default: 1,
    },
    previousVersionId: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
    },
}, {
    timestamps: true,
});
// Indexes
ContractSchema.index({ projectId: 1, status: 1 });
ContractSchema.index({ clientId: 1, status: 1 });
ContractSchema.index({ freelancerId: 1, status: 1 });
const Contract = mongoose.model('Contract', ContractSchema);
export default Contract;

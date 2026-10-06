import mongoose, { Schema } from 'mongoose';
const WithdrawalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'NGN',
        uppercase: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
    },
    bankDetails: {
        accountName: {
            type: String,
            required: true,
        },
        accountNumber: {
            type: String,
            required: true,
        },
        bankName: {
            type: String,
            default: '',
        },
        bankCode: {
            type: String,
            required: true,
        },
    },
    gatewayReference: {
        type: String,
        sparse: true,
        index: true,
    },
    gatewayResponse: {
        type: Schema.Types.Mixed,
    },
    transferCode: {
        type: String,
    },
    idempotencyKey: {
        type: String,
        sparse: true,
        index: true,
    },
    processingFee: {
        type: Number,
        default: 0,
    },
    netAmount: {
        type: Number,
    },
    failureReason: {
        type: String,
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    processedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes
WithdrawalSchema.index({ userId: 1, status: 1 });
WithdrawalSchema.index({ createdAt: -1 });
WithdrawalSchema.pre('save', function (next) {
    if (this.netAmount === undefined || this.netAmount === null) {
        this.netAmount = Math.max(0, (Number(this.amount) || 0) - (Number(this.processingFee) || 0));
    }
    next();
});
export default mongoose.model('Withdrawal', WithdrawalSchema);

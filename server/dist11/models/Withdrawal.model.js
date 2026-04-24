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
        enum: ['NGN', 'USD', 'EUR', 'GBP'],
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
            required: true,
        },
        bankCode: {
            type: String,
            required: true,
        },
    },
    gatewayReference: {
        type: String,
    },
    gatewayResponse: {
        type: Schema.Types.Mixed,
    },
    transferCode: {
        type: String,
    },
    processingFee: {
        type: Number,
        default: 0,
    },
    netAmount: {
        type: Number,
        required: true,
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
export default mongoose.model('Withdrawal', WithdrawalSchema);

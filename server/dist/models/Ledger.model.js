import mongoose, { Schema } from 'mongoose';
const LedgerSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    walletId: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        index: true,
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
    },
    transactionId: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
    },
    withdrawalId: {
        type: Schema.Types.ObjectId,
        ref: 'Withdrawal',
        index: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
    },
    action: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    category: {
        type: String,
        enum: [
            'deposit',
            'withdrawal',
            'escrow_hold',
            'escrow_release',
            'escrow_refund',
            'job_verification',
            'fee',
            'bonus',
            'payout_refund',
            'adjustment',
        ],
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
    balanceBefore: {
        type: Number,
        required: true,
        default: 0,
    },
    balanceAfter: {
        type: Number,
        required: true,
        default: 0,
    },
    escrowBalanceBefore: {
        type: Number,
        default: 0,
    },
    escrowBalanceAfter: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['posted', 'pending', 'failed', 'reversed'],
        default: 'posted',
        required: true,
    },
    reference: {
        type: String,
        required: true,
        trim: true,
    },
    gateway: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
// Indexes for performance and double-entry consistency
LedgerSchema.index({ userId: 1, createdAt: -1 });
LedgerSchema.index({ reference: 1, category: 1, userId: 1, action: 1 }, { unique: true, sparse: true });
LedgerSchema.index({ category: 1, status: 1 });
LedgerSchema.index({ paymentId: 1 });
LedgerSchema.index({ transactionId: 1 });
LedgerSchema.index({ createdAt: -1 });
export default mongoose.model('Ledger', LedgerSchema);

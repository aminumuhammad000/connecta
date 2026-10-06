import mongoose, { Document, Schema } from 'mongoose';

export interface ILedger extends Document {
  userId: mongoose.Types.ObjectId;
  walletId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  transactionId?: mongoose.Types.ObjectId;
  withdrawalId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;

  action: 'credit' | 'debit';
  category:
    | 'deposit'
    | 'withdrawal'
    | 'escrow_hold'
    | 'escrow_release'
    | 'escrow_refund'
    | 'job_verification'
    | 'fee'
    | 'bonus'
    | 'payout_refund'
    | 'adjustment';

  amount: number;
  currency: string;

  balanceBefore: number;
  balanceAfter: number;
  escrowBalanceBefore?: number;
  escrowBalanceAfter?: number;

  status: 'posted' | 'pending' | 'failed' | 'reversed';
  reference: string;
  gateway?: string;
  description: string;
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const LedgerSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and double-entry consistency
LedgerSchema.index({ userId: 1, createdAt: -1 });
LedgerSchema.index({ reference: 1, category: 1, userId: 1, action: 1 }, { unique: true, sparse: true });
LedgerSchema.index({ category: 1, status: 1 });
LedgerSchema.index({ paymentId: 1 });
LedgerSchema.index({ transactionId: 1 });
LedgerSchema.index({ createdAt: -1 });

export default mongoose.model<ILedger>('Ledger', LedgerSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'payment_received' | 'payment_sent' | 'refund' | 'fee' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  
  // Related Documents
  paymentId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  
  // Balance tracking
  balanceBefore: number;
  balanceAfter: number;
  
  // Payment Gateway
  gateway?: 'flutterwave' | 'paystack' | 'vtstack' | 'stripe';
  gatewayReference?: string;
  gatewayResponse?: any;
  
  // Description
  description: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'payment_received', 'payment_sent', 'refund', 'fee', 'bonus'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    balanceBefore: {
      type: Number,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    gateway: {
      type: String,
      enum: ['flutterwave', 'paystack', 'vtstack', 'stripe'],
    },
    gatewayReference: {
      type: String,
      sparse: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
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

// Indexes for performance and database-level duplicate protection
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ paymentId: 1 });
TransactionSchema.index({ gatewayReference: 1, type: 1 }, { unique: true, sparse: true });
TransactionSchema.index({ paymentId: 1, type: 1, userId: 1 }, { unique: true, sparse: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

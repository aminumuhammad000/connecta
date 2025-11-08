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
  gatewayReference?: string;
  gatewayResponse?: any;
  
  // Description
  description: string;
  metadata?: Record<string, any>;
  
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
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
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
    gatewayReference: {
      type: String,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
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

// Indexes
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ paymentId: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

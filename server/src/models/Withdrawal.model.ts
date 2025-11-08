import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Bank details
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };
  
  // Payment gateway
  gatewayReference?: string;
  gatewayResponse?: any;
  transferCode?: string;
  
  // Fees
  processingFee: number;
  netAmount: number;
  
  // Reason for failure/cancellation
  failureReason?: string;
  
  // Admin approval
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  
  // Processing dates
  processedAt?: Date;
  completedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Indexes
WithdrawalSchema.index({ userId: 1, status: 1 });
WithdrawalSchema.index({ createdAt: -1 });

export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);

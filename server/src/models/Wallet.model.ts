import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  
  // Escrow balance (money held for ongoing projects)
  escrowBalance: number;
  
  // Available balance (can be withdrawn)
  availableBalance: number;
  
  // Total earnings (for freelancers)
  totalEarnings: number;
  
  // Total spent (for clients)
  totalSpent: number;
  
  // Bank account details for withdrawals
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };
  
  // Payment gateway customer ID
  paystackCustomerId?: string;
  stripeCustomerId?: string;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },
    escrowBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      bankCode: String,
    },
    paystackCustomerId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WalletSchema.index({ userId: 1 });

// Update available balance before saving
WalletSchema.pre('save', function (next) {
  const balance = Number(this.balance) || 0;
  const escrow = Number(this.escrowBalance) || 0;
  this.availableBalance = balance - escrow;
  next();
});

export default mongoose.model<IWallet>('Wallet', WalletSchema);

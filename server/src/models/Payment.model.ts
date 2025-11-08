import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  projectId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  payerId: mongoose.Types.ObjectId; // Client
  payeeId: mongoose.Types.ObjectId; // Freelancer
  amount: number;
  currency: string;
  platformFee: number;
  netAmount: number; // Amount after platform fee
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'paystack' | 'stripe' | 'paypal' | 'bank_transfer';
  paymentType: 'milestone' | 'full_payment' | 'hourly' | 'bonus' | 'job_verification';
  
  // Payment Gateway Details
  gatewayReference: string; // Reference from payment gateway
  gatewayResponse?: any;
  
  // Escrow Details
  escrowStatus: 'held' | 'released' | 'refunded' | 'none';
  escrowReleaseDate?: Date;
  
  // Invoice Details
  invoiceNumber?: string;
  invoiceUrl?: string;
  
  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  paidAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Project.milestones',
    },
    payerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payeeId: {
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
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'stripe', 'paypal', 'bank_transfer'],
      default: 'paystack',
    },
    paymentType: {
      type: String,
      enum: ['milestone', 'full_payment', 'hourly', 'bonus', 'job_verification'],
      default: 'milestone',
    },
    gatewayReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    escrowStatus: {
      type: String,
      enum: ['held', 'released', 'refunded', 'none'],
      default: 'held',
    },
    escrowReleaseDate: {
      type: Date,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    paidAt: {
      type: Date,
    },
    releasedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
PaymentSchema.index({ projectId: 1, status: 1 });
PaymentSchema.index({ payerId: 1, status: 1 });
PaymentSchema.index({ payeeId: 1, status: 1 });
PaymentSchema.index({ gatewayReference: 1 });
PaymentSchema.index({ createdAt: -1 });

// Generate invoice number before saving
PaymentSchema.pre('save', async function (next) {
  if (!this.invoiceNumber && this.isNew) {
    const count = await mongoose.model('Payment').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);

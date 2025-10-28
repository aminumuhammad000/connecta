import mongoose, { Document, Schema } from 'mongoose';

export interface IProposal extends Document {
  title: string;
  recommended: boolean;
  description: string;
  budget: {
    amount: number;
    currency: string;
  };
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  type: 'recommendation' | 'referral';
  referredBy?: mongoose.Types.ObjectId | string;
  referredByName?: string;
  freelancerId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  level: 'entry' | 'intermediate' | 'expert';
  priceType: 'fixed' | 'hourly';
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: '₦',
      },
    },
    dateRange: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    type: {
      type: String,
      enum: ['recommendation', 'referral'],
      required: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    referredByName: {
      type: String,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    level: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'entry',
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ProposalSchema.index({ freelancerId: 1, status: 1 });
ProposalSchema.index({ type: 1, freelancerId: 1 });
ProposalSchema.index({ createdAt: -1 });

export default mongoose.model<IProposal>('Proposal', ProposalSchema);

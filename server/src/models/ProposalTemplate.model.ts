import mongoose, { Document, Schema } from 'mongoose';

export interface IProposalTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  coverLetter: string;
  priceType: 'fixed' | 'hourly';
  defaultBudget?: {
    amount: number;
    currency: string;
  };
  defaultTimeline?: number; // days
  tags?: string[];
  usageCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalTemplateSchema = new Schema<IProposalTemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: true,
    },
    defaultBudget: {
      amount: Number,
      currency: {
        type: String,
        default: 'NGN',
      },
    },
    defaultTimeline: Number,
    tags: [String],
    usageCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProposalTemplateSchema.index({ userId: 1, createdAt: -1 });
ProposalTemplateSchema.index({ tags: 1 });

const ProposalTemplate = mongoose.model<IProposalTemplate>('ProposalTemplate', ProposalTemplateSchema);

export default ProposalTemplate;

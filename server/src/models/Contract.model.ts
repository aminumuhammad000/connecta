import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  jobId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  proposalId: mongoose.Types.ObjectId;
  
  // Contract Details
  title: string;
  description: string;
  totalPrice: number;
  deliveryTime: number; // In days
  
  // Status
  status: 'pending' | 'active' | 'delivered' | 'completed' | 'terminated' | 'disputed';
  paymentStatus: 'pending' | 'escrow' | 'released' | 'refunded';
  
  // Submission
  submission?: {
    summary: string;
    files: string[]; // URLs/Paths
    submittedAt: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveryTime: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'delivered', 'completed', 'terminated', 'disputed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'escrow', 'released', 'refunded'],
      default: 'pending',
    },
    submission: {
      summary: String,
      files: [String],
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ContractSchema.index({ jobId: 1 });
ContractSchema.index({ clientId: 1, status: 1 });
ContractSchema.index({ freelancerId: 1, status: 1 });

const Contract = mongoose.model<IContract>('Contract', ContractSchema);

export default Contract;


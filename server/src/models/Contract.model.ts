import mongoose, { Document, Schema } from 'mongoose';

export interface ISignature {
  userId: mongoose.Types.ObjectId;
  userName: string;
  signedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface IContractTerm {
  title: string;
  description: string;
  order: number;
}

export interface IContract extends Document {
  projectId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  
  // Parties
  clientId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  
  // Contract Details
  title: string;
  description: string;
  contractType: 'fixed_price' | 'hourly' | 'milestone';
  
  // Terms
  terms: IContractTerm[];
  customTerms?: string;
  
  // Payment Details
  budget: {
    amount: number;
    currency: string;
    paymentSchedule?: string;
  };
  
  // Timeline
  startDate: Date;
  endDate: Date;
  estimatedHours?: number;
  
  // Deliverables
  deliverables: string[];
  
  // Status
  status: 'draft' | 'pending_signatures' | 'active' | 'completed' | 'terminated' | 'disputed';
  
  // Signatures
  clientSignature?: ISignature;
  freelancerSignature?: ISignature;
  
  // Templates
  templateId?: mongoose.Types.ObjectId;
  
  // Amendments
  amendments?: {
    description: string;
    amendedBy: mongoose.Types.ObjectId;
    amendedAt: Date;
    approved: boolean;
  }[];
  
  // Termination
  terminatedBy?: mongoose.Types.ObjectId;
  terminationReason?: string;
  terminatedAt?: Date;
  
  // Dispute
  disputeId?: mongoose.Types.ObjectId;
  
  // Metadata
  version: number;
  previousVersionId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  signedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: String,
  userAgent: String,
});

const ContractTermSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const ContractSchema = new Schema<IContract>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    contractType: {
      type: String,
      enum: ['fixed_price', 'hourly', 'milestone'],
      required: true,
    },
    terms: [ContractTermSchema],
    customTerms: String,
    budget: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'NGN',
      },
      paymentSchedule: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    estimatedHours: Number,
    deliverables: [String],
    status: {
      type: String,
      enum: ['draft', 'pending_signatures', 'active', 'completed', 'terminated', 'disputed'],
      default: 'draft',
      index: true,
    },
    clientSignature: SignatureSchema,
    freelancerSignature: SignatureSchema,
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'ContractTemplate',
    },
    amendments: [{
      description: String,
      amendedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      amendedAt: Date,
      approved: Boolean,
    }],
    terminatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    terminationReason: String,
    terminatedAt: Date,
    disputeId: {
      type: Schema.Types.ObjectId,
      ref: 'Dispute',
    },
    version: {
      type: Number,
      default: 1,
    },
    previousVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ContractSchema.index({ projectId: 1, status: 1 });
ContractSchema.index({ clientId: 1, status: 1 });
ContractSchema.index({ freelancerId: 1, status: 1 });

const Contract = mongoose.model<IContract>('Contract', ContractSchema);

export default Contract;

import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkforceContract extends Document {
  companyId: mongoose.Types.ObjectId;
  workforceMemberId: mongoose.Types.ObjectId;
  workerId?: mongoose.Types.ObjectId;
  jobTitle: string;
  startDate: Date;
  endDate?: Date;
  employmentType: string;
  paymentType: string;
  paymentAmount: number;
  currency: string;
  responsibilities: string;
  terms: string;
  status: 'draft' | 'sent' | 'accepted' | 'active' | 'completed' | 'terminated';
  acceptedAt?: Date;
  signatureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkforceContractSchema = new Schema<IWorkforceContract>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workforceMemberId: { type: Schema.Types.ObjectId, ref: 'WorkforceMember', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User' },
    jobTitle: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    employmentType: { type: String, default: 'contract' },
    paymentType: { type: String, default: 'monthly' },
    paymentAmount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    responsibilities: { type: String, default: '' },
    terms: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'active', 'completed', 'terminated'],
      default: 'sent',
      index: true,
    },
    acceptedAt: { type: Date },
    signatureUrl: { type: String },
  },
  { timestamps: true }
);

const WorkforceContract = mongoose.model<IWorkforceContract>('WorkforceContract', WorkforceContractSchema);
export default WorkforceContract;

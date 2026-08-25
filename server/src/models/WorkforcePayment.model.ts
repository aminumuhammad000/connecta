import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkforcePayment extends Document {
  companyId: mongoose.Types.ObjectId;
  workforceMemberId: mongoose.Types.ObjectId;
  workerId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentType: 'monthly' | 'weekly' | 'daily' | 'hourly' | 'one_time' | 'milestone';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  reference: string;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkforcePaymentSchema = new Schema<IWorkforcePayment>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workforceMemberId: { type: Schema.Types.ObjectId, ref: 'WorkforceMember', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    paymentType: {
      type: String,
      enum: ['monthly', 'weekly', 'daily', 'hourly', 'one_time', 'milestone'],
      default: 'monthly',
    },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed', index: true },
    description: { type: String, default: '' },
    reference: { type: String, required: true, unique: true },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const WorkforcePayment = mongoose.model<IWorkforcePayment>('WorkforcePayment', WorkforcePaymentSchema);
export default WorkforcePayment;

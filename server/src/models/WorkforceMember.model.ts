import mongoose, { Document, Schema } from 'mongoose';

export type EmploymentType = 'full_time' | 'part_time' | 'temporary' | 'contract' | 'project' | 'daily' | 'hourly';
export type PaymentType = 'monthly' | 'weekly' | 'daily' | 'hourly' | 'one_time' | 'milestone';

export interface IWorkforceMember extends Document {
  companyId: mongoose.Types.ObjectId;
  workerId?: mongoose.Types.ObjectId; // Connecta User ID if linked
  fullName: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  location: string;
  employmentType: EmploymentType;
  paymentType: PaymentType;
  paymentAmount: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'pending' | 'inactive';
  inviteStatus: 'sent' | 'accepted' | 'declined';
  inviteToken?: string;
  companyRole: 'owner' | 'manager' | 'finance' | 'worker';
  payoutStatus?: 'active' | 'frozen' | 'paused';
  idNumber?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkforceMemberSchema = new Schema<IWorkforceMember>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    location: { type: String, default: '' },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'temporary', 'contract', 'project', 'daily', 'hourly'],
      default: 'contract',
    },
    paymentType: {
      type: String,
      enum: ['monthly', 'weekly', 'daily', 'hourly', 'one_time', 'milestone'],
      default: 'monthly',
    },
    paymentAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'NGN' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active', index: true },
    inviteStatus: { type: String, enum: ['sent', 'accepted', 'declined'], default: 'accepted' },
    inviteToken: { type: String },
    companyRole: { type: String, enum: ['owner', 'manager', 'finance', 'worker'], default: 'worker' },
    payoutStatus: { type: String, enum: ['active', 'frozen', 'paused'], default: 'active' },
    idNumber: { type: String },
    profileImage: { type: String },
  },
  { timestamps: true }
);

WorkforceMemberSchema.index({ companyId: 1, email: 1 }, { unique: true });

const WorkforceMember = mongoose.model<IWorkforceMember>('WorkforceMember', WorkforceMemberSchema);
export default WorkforceMember;

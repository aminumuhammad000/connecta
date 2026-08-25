import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkforceSettings extends Document {
  companyId: mongoose.Types.ObjectId;
  onboardingCompleted: boolean;
  objectives: string[];
  workerCountRange: string;
  hasExistingWorkers: boolean;
  requireLocationForAttendance: boolean;
  allowSelfCheckIn: boolean;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkforceSettingsSchema = new Schema<IWorkforceSettings>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    onboardingCompleted: { type: Boolean, default: false },
    objectives: { type: [String], default: [] },
    workerCountRange: { type: String, default: '1-10' },
    hasExistingWorkers: { type: Boolean, default: true },
    requireLocationForAttendance: { type: Boolean, default: false },
    allowSelfCheckIn: { type: Boolean, default: true },
    defaultCurrency: { type: String, default: 'NGN' },
  },
  { timestamps: true }
);

const WorkforceSettings = mongoose.model<IWorkforceSettings>('WorkforceSettings', WorkforceSettingsSchema);
export default WorkforceSettings;

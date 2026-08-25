import mongoose, { Schema } from 'mongoose';
const WorkforceSettingsSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    onboardingCompleted: { type: Boolean, default: false },
    objectives: { type: [String], default: [] },
    workerCountRange: { type: String, default: '1-10' },
    hasExistingWorkers: { type: Boolean, default: true },
    requireLocationForAttendance: { type: Boolean, default: false },
    allowSelfCheckIn: { type: Boolean, default: true },
    defaultCurrency: { type: String, default: 'NGN' },
}, { timestamps: true });
const WorkforceSettings = mongoose.model('WorkforceSettings', WorkforceSettingsSchema);
export default WorkforceSettings;

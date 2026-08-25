import mongoose, { Schema } from 'mongoose';
const WorkforceAttendanceSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workforceMemberId: { type: Schema.Types.ObjectId, ref: 'WorkforceMember', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    date: { type: String, required: true, index: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String },
    },
    notes: { type: String, default: '' },
}, { timestamps: true });
WorkforceAttendanceSchema.index({ companyId: 1, workforceMemberId: 1, date: 1 }, { unique: true });
const WorkforceAttendance = mongoose.model('WorkforceAttendance', WorkforceAttendanceSchema);
export default WorkforceAttendance;

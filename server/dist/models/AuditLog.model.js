import mongoose, { Schema } from 'mongoose';
const AuditLogSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    adminName: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE',
            'UPDATE',
            'DELETE',
            'APPROVE',
            'REJECT',
            'BAN',
            'UNBAN',
            'LOGIN',
            'LOGOUT',
            'SETTINGS_UPDATE',
            'BULK_DELETE',
            'BULK_BAN',
            'BULK_UNBAN',
        ],
    },
    entityType: {
        type: String,
        required: true,
        enum: ['User', 'Job', 'Project', 'Proposal', 'Payment', 'Review', 'Verification', 'Subscription', 'Contract', 'Settings'],
    },
    entityId: {
        type: String,
    },
    entityName: {
        type: String,
    },
    details: {
        type: Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
export default mongoose.model('AuditLog', AuditLogSchema);

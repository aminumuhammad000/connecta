import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

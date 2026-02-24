import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            'info',
            'success',
            'warning',
            'error',
            'job_posted',
            'proposal_received',
            'proposal_accepted',
            'proposal_rejected',
            'proposal_new',
            'project_started',
            'project_completed',
            'milestone_completed',
            'payment_received',
            'payment_released',
            'message_received',
            'review_received',
            'deadline_approaching',
            'contract_signed',
            'gig_matched',
            'collabo_invite',
            'collabo_started',
            'job_invite',
            'system',
        ],
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    relatedId: {
        type: Schema.Types.ObjectId,
    },
    relatedType: {
        type: String,
        enum: ['job', 'project', 'proposal', 'message', 'review', 'payment', 'user'],
    },
    actorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    actorName: String,
    link: String,
    icon: String,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
    readAt: Date,
}, {
    timestamps: true,
});
// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;

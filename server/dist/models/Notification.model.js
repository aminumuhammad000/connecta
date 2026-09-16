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
        default: 'system',
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

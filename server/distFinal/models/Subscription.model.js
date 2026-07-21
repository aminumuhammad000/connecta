import mongoose, { Schema } from 'mongoose';
const SubscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        enum: ['basic', 'premium', 'enterprise'],
        default: 'premium',
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'NGN',
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active',
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    paymentReference: {
        type: String,
        required: true,
    },
    autoRenew: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, createdAt: -1 });
export default mongoose.model('Subscription', SubscriptionSchema);

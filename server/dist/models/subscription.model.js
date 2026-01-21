import mongoose, { Schema } from 'mongoose';
const subscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
    },
    amount: {
        type: Number,
        required: true,
        default: 0,
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
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    paymentReference: {
        type: String,
    },
    autoRenew: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

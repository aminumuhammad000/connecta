import mongoose, { Schema } from 'mongoose';
const SparkTransactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['daily_reward', 'project_completed', 'referral', 'spend', 'bonus', 'purchase', 'transfer_send', 'transfer_receive'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    balanceAfter: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
SparkTransactionSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('SparkTransaction', SparkTransactionSchema);

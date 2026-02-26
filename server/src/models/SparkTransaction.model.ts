import mongoose, { Document, Schema } from 'mongoose';

export interface ISparkTransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'daily_reward' | 'project_completed' | 'referral' | 'spend' | 'bonus' | 'purchase' | 'transfer_send' | 'transfer_receive';
    amount: number; // positive for gain, negative for spend
    balanceAfter: number;
    description: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const SparkTransactionSchema: Schema = new Schema(
    {
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
    },
    {
        timestamps: true,
    }
);

SparkTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ISparkTransaction>('SparkTransaction', SparkTransactionSchema);

import mongoose, { Schema } from 'mongoose';
const ProposalTemplateSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    coverLetter: {
        type: String,
        required: true,
    },
    priceType: {
        type: String,
        enum: ['fixed', 'hourly'],
        required: true,
    },
    defaultBudget: {
        amount: Number,
        currency: {
            type: String,
            default: 'NGN',
        },
    },
    defaultTimeline: Number,
    tags: [String],
    usageCount: {
        type: Number,
        default: 0,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes
ProposalTemplateSchema.index({ userId: 1, createdAt: -1 });
ProposalTemplateSchema.index({ tags: 1 });
const ProposalTemplate = mongoose.model('ProposalTemplate', ProposalTemplateSchema);
export default ProposalTemplate;

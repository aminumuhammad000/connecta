import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    reviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    revieweeId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviewerType: {
        type: String,
        enum: ['client', 'freelancer'],
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    tags: {
        type: [String],
        default: [],
    },
    response: {
        type: String,
        maxlength: 500,
    },
    respondedAt: Date,
    isPublic: {
        type: Boolean,
        default: true,
    },
    isFlagged: {
        type: Boolean,
        default: false,
    },
    flagReason: String,
    helpfulCount: {
        type: Number,
        default: 0,
    },
    notHelpfulCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Indexes
ReviewSchema.index({ revieweeId: 1, createdAt: -1 });
ReviewSchema.index({ projectId: 1 });
ReviewSchema.index({ rating: 1 });
// Prevent duplicate reviews for same project/context
ReviewSchema.index({ projectId: 1, reviewerId: 1, revieweeId: 1 }, { unique: true });
const Review = mongoose.model('Review', ReviewSchema);
export default Review;

import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    reviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Changed from true to false for guest reviews
    },
    revieweeId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Changed from true to false for platform reviews
    },
    // Guest fields
    guestName: {
        type: String,
        trim: true
    },
    guestEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    guestRole: {
        type: String, // e.g. "Client", "Freelancer"
        default: 'Visitor'
    },
    reviewerType: {
        type: String,
        enum: ['client', 'freelancer', 'guest'],
        required: true,
        default: 'guest'
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
        default: false, // Default to false for guests for moderation
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
// Prevent duplicate reviews for same project/context (if project exists)
ReviewSchema.index({ projectId: 1, reviewerId: 1, revieweeId: 1 }, {
    unique: true,
    partialFilterExpression: { projectId: { $exists: true } }
});
const Review = mongoose.model('Review', ReviewSchema);
export default Review;

import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  projectId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId; // Person giving the review
  revieweeId: mongoose.Types.ObjectId; // Person receiving the review
  reviewerType: 'client' | 'freelancer';
  rating: number; // 1-5 stars
  comment: string;
  tags?: string[]; // e.g., ['Professional', 'On Time', 'Great Communication']
  
  // Response from reviewee
  response?: string;
  respondedAt?: Date;
  
  // Moderation
  isPublic: boolean;
  isFlagged: boolean;
  flagReason?: string;
  
  // Helpful votes
  helpfulCount: number;
  notHelpfulCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ revieweeId: 1, createdAt: -1 });
ReviewSchema.index({ projectId: 1 });
ReviewSchema.index({ rating: 1 });

// Prevent duplicate reviews for same project
ReviewSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });

const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

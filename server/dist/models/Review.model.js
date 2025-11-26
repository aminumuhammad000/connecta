"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ReviewSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    reviewerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    revieweeId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
// Prevent duplicate reviews for same project
ReviewSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });
const Review = mongoose_1.default.model('Review', ReviewSchema);
exports.default = Review;

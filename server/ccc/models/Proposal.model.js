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
const ProposalSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    recommended: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        required: true,
    },
    budget: {
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: '₦',
        },
    },
    dateRange: {
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    type: {
        type: String,
        enum: ['recommendation', 'referral'],
        required: true,
    },
    referredBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    referredByName: {
        type: String,
    },
    freelancerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Job',
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired', 'approved', 'withdrawn'],
        default: 'pending',
    },
    level: {
        type: String,
        enum: ['entry', 'intermediate', 'expert'],
        default: 'entry',
    },
    priceType: {
        type: String,
        enum: ['fixed', 'hourly'],
        default: 'fixed',
    },
    // New fields
    coverLetter: String,
    templateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ProposalTemplate',
    },
    isCustomized: {
        type: Boolean,
        default: false,
    },
    editHistory: [{
            editedAt: Date,
            changes: String,
        }],
    lastEditedAt: Date,
    withdrawnAt: Date,
    withdrawalReason: String,
    expiresAt: Date,
    counterOffers: [{
            amount: Number,
            message: String,
            offeredBy: {
                type: String,
                enum: ['client', 'freelancer'],
            },
            offeredAt: Date,
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending',
            },
        }],
    views: {
        type: Number,
        default: 0,
    },
    viewedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
}, {
    timestamps: true,
});
// Index for faster queries
ProposalSchema.index({ freelancerId: 1, status: 1 });
ProposalSchema.index({ type: 1, freelancerId: 1 });
ProposalSchema.index({ createdAt: -1 });
ProposalSchema.index({ jobId: 1 });
ProposalSchema.index({ expiresAt: 1 });
exports.default = mongoose_1.default.model('Proposal', ProposalSchema);

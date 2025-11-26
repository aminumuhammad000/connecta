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
const PaymentSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
    },
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Job',
    },
    milestoneId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project.milestones',
    },
    payerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    payeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'NGN',
        enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },
    platformFee: {
        type: Number,
        default: 0,
        min: 0,
    },
    netAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['paystack', 'stripe', 'paypal', 'bank_transfer'],
        default: 'paystack',
    },
    paymentType: {
        type: String,
        enum: ['milestone', 'full_payment', 'hourly', 'bonus', 'job_verification'],
        default: 'milestone',
    },
    gatewayReference: {
        type: String,
        unique: true,
        sparse: true,
    },
    gatewayResponse: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    escrowStatus: {
        type: String,
        enum: ['held', 'released', 'refunded', 'none'],
        default: 'held',
    },
    escrowReleaseDate: {
        type: Date,
    },
    invoiceNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    invoiceUrl: {
        type: String,
    },
    description: {
        type: String,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    paidAt: {
        type: Date,
    },
    releasedAt: {
        type: Date,
    },
    refundedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
PaymentSchema.index({ projectId: 1, status: 1 });
PaymentSchema.index({ payerId: 1, status: 1 });
PaymentSchema.index({ payeeId: 1, status: 1 });
PaymentSchema.index({ gatewayReference: 1 });
PaymentSchema.index({ createdAt: -1 });
// Generate invoice number before saving
PaymentSchema.pre('save', async function (next) {
    if (!this.invoiceNumber && this.isNew) {
        const count = await mongoose_1.default.model('Payment').countDocuments();
        this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
    }
    next();
});
exports.default = mongoose_1.default.model('Payment', PaymentSchema);

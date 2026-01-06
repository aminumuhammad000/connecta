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
const SignatureSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    signedAt: {
        type: Date,
        default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
});
const ContractTermSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
});
const ContractSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Job',
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    freelancerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    contractType: {
        type: String,
        enum: ['fixed_price', 'hourly', 'milestone'],
        required: true,
    },
    terms: [ContractTermSchema],
    customTerms: String,
    budget: {
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'NGN',
        },
        paymentSchedule: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    estimatedHours: Number,
    deliverables: [String],
    status: {
        type: String,
        enum: ['draft', 'pending_signatures', 'active', 'completed', 'terminated', 'disputed'],
        default: 'draft',
        index: true,
    },
    clientSignature: SignatureSchema,
    freelancerSignature: SignatureSchema,
    templateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ContractTemplate',
    },
    amendments: [{
            description: String,
            amendedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
            amendedAt: Date,
            approved: Boolean,
        }],
    terminatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    terminationReason: String,
    terminatedAt: Date,
    disputeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Dispute',
    },
    version: {
        type: Number,
        default: 1,
    },
    previousVersionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Contract',
    },
}, {
    timestamps: true,
});
// Indexes
ContractSchema.index({ projectId: 1, status: 1 });
ContractSchema.index({ clientId: 1, status: 1 });
ContractSchema.index({ freelancerId: 1, status: 1 });
const Contract = mongoose_1.default.model('Contract', ContractSchema);
exports.default = Contract;

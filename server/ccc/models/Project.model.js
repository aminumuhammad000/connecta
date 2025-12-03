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
const ProjectSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
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
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'cancelled'],
        default: 'ongoing',
    },
    statusLabel: {
        type: String,
        default: 'Active',
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    clientVerified: {
        type: Boolean,
        default: false,
    },
    freelancerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    budget: {
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: '$',
        },
        type: {
            type: String,
            enum: ['fixed', 'hourly'],
            default: 'fixed',
        },
    },
    projectType: {
        type: String,
        default: 'One-time project',
    },
    deliverables: [{
            type: String,
        }],
    activity: [{
            date: {
                type: Date,
                default: Date.now,
            },
            description: {
                type: String,
            },
        }],
    uploads: [{
            fileName: String,
            fileUrl: String,
            fileType: String,
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
            uploadedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
        }],
    milestones: [{
            title: String,
            status: {
                type: String,
                enum: ['pending', 'in-progress', 'completed'],
                default: 'pending',
            },
            dueDate: Date,
            amount: Number,
        }],
}, {
    timestamps: true,
});
// Indexes for faster queries
ProjectSchema.index({ freelancerId: 1, status: 1 });
ProjectSchema.index({ clientId: 1, status: 1 });
ProjectSchema.index({ status: 1, createdAt: -1 });
exports.default = mongoose_1.default.model('Project', ProjectSchema);

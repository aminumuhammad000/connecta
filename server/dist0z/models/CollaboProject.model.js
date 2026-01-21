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
const CollaboProjectSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    totalBudget: { type: Number, required: true },
    category: { type: String },
    niche: { type: String },
    projectType: {
        type: String,
        enum: ["one-time", "ongoing", "permanent", "adhoc"],
        default: "one-time"
    },
    scope: {
        type: String,
        enum: ["local", "international"],
        default: "local"
    },
    duration: { type: String },
    durationType: { type: String, enum: ["days", "weeks", "months", "years"], default: "months" },
    status: {
        type: String,
        enum: ["planning", "active", "completed", "cancelled"],
        default: "planning",
    },
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: "CollaboWorkspace" },
    milestones: [{
            title: String,
            description: String,
            duration: String,
            deliverables: [String]
        }],
    recommendedStack: [String],
    risks: [String]
}, { timestamps: true });
exports.default = mongoose_1.default.model("CollaboProject", CollaboProjectSchema);

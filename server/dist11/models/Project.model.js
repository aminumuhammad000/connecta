import mongoose, { Schema } from 'mongoose';
const ProjectSchema = new Schema({
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
        enum: ['ongoing', 'submitted', 'completed', 'cancelled', 'arbitration'],
        default: 'ongoing',
    },
    statusLabel: {
        type: String,
        default: 'Active',
    },
    clientId: {
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
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
                type: Schema.Types.ObjectId,
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
export default mongoose.model('Project', ProjectSchema);

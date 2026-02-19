
import mongoose from 'mongoose';

interface JobAttrs {
    title: string;
    description: string;
    budget: number;
    userId: string;
    category: string;
    status: 'draft' | 'published' | 'paused' | 'closed';
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    visibility: 'public' | 'invite-only';
    skillsRequired: string[];
    attachments?: string[];
    deadline?: Date;
}

interface JobDoc extends mongoose.Document {
    title: string;
    description: string;
    budget: number;
    userId: string;
    category: string;
    status: 'draft' | 'published' | 'paused' | 'closed';
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    visibility: 'public' | 'invite-only';
    skillsRequired: string[];
    attachments?: string[];
    deadline?: Date;
    deletedAt?: Date;
    createdAt: string;
    updatedAt: string;
    version: number;
}

interface JobModel extends mongoose.Model<JobDoc> {
    build(attrs: JobAttrs): JobDoc;
}

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: true,
            min: 0,
        },
        userId: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'paused', 'closed'],
            default: 'draft',
        },
        experienceLevel: {
            type: String,
            enum: ['entry', 'intermediate', 'expert'],
            default: 'intermediate',
        },
        visibility: {
            type: String,
            enum: ['public', 'invite-only'],
            default: 'public',
        },
        skillsRequired: {
            type: [String],
            default: [],
        },
        attachments: {
            type: [String],
            default: [],
        },
        deadline: {
            type: Date,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        toJSON: {
            transform(doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
        timestamps: true,
        optimisticConcurrency: true,
        versionKey: 'version',
    }
);

jobSchema.statics.build = (attrs: JobAttrs) => {
    return new Job(attrs);
};

const Job = mongoose.model<JobDoc, JobModel>('Job', jobSchema);

export { Job };

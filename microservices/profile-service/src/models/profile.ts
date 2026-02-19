
import mongoose from 'mongoose';

interface ProfileAttrs {
    userId: string;
    email: string;
    role: string;
    bio?: string;
    skills?: string[];
    portfolio?: string[];
    hourlyRate?: number;
    availabilityStatus?: 'available' | 'busy' | 'offline';
    website?: string;
    socialLinks?: {
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
    certifications?: string[];
    languages?: {
        language: string;
        proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
    }[];
    location?: {
        country: string;
        state: string;
        city: string;
    };
    avatar?: string;
    preferences?: {
        remoteWorkType: 'remote_only' | 'hybrid' | 'onsite';
        minimumSalary?: number;
        jobNotificationFrequency: 'daily' | 'weekly' | 'relevant_only';
    };
}

interface ProfileDoc extends mongoose.Document {
    userId: string;
    email: string;
    role: string;
    bio?: string;
    skills?: string[];
    portfolio?: string[];
    hourlyRate?: number;
    availabilityStatus?: 'available' | 'busy' | 'offline';
    website?: string;
    socialLinks?: {
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
    certifications?: string[];
    languages?: {
        language: string;
        proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
    }[];
    location?: {
        country: string;
        state: string;
        city: string;
    };
    avatar?: string;
    preferences?: {
        remoteWorkType: 'remote_only' | 'hybrid' | 'onsite';
        minimumSalary?: number;
        jobNotificationFrequency: 'daily' | 'weekly' | 'relevant_only';
    };
    version: number;
}

interface ProfileModel extends mongoose.Model<ProfileDoc> {
    build(attrs: ProfileAttrs): ProfileDoc;
}

const profileSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true, // One profile per user
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
        },
        skills: {
            type: [String],
        },
        portfolio: {
            type: [String],
        },
        hourlyRate: {
            type: Number,
        },
        availabilityStatus: {
            type: String,
            enum: ['available', 'busy', 'offline'],
            default: 'available',
        },
        website: {
            type: String,
        },
        socialLinks: {
            linkedin: String,
            github: String,
            twitter: String,
        },
        certifications: {
            type: [String],
        },
        languages: [{
            language: String,
            proficiency: {
                type: String,
                enum: ['basic', 'conversational', 'fluent', 'native'],
            }
        }],
        location: {
            country: String,
            state: String,
            city: String,
        },
        avatar: {
            type: String,
        },
        preferences: {
            remoteWorkType: {
                type: String,
                enum: ['remote_only', 'hybrid', 'onsite'],
            },
            minimumSalary: Number,
            jobNotificationFrequency: {
                type: String,
                enum: ['daily', 'weekly', 'relevant_only'],
            },
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

profileSchema.statics.build = (attrs: ProfileAttrs) => {
    return new Profile(attrs);
};

const Profile = mongoose.model<ProfileDoc, ProfileModel>('Profile', profileSchema);

export { Profile };

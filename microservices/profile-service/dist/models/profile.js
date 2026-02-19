"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const profileSchema = new mongoose_1.default.Schema({
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
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version',
});
profileSchema.statics.build = (attrs) => {
    return new Profile(attrs);
};
const Profile = mongoose_1.default.model('Profile', profileSchema);
exports.Profile = Profile;

import mongoose, { Schema, Document } from 'mongoose';

interface IMedia extends Document {
    userId: string;
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        fileName: { type: String, required: true },
        fileType: { type: String, required: true },
        size: { type: Number, required: true },
    },
    { timestamps: true }
);

export const Media = mongoose.model<IMedia>('Media', MediaSchema);

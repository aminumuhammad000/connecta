import mongoose, { Schema } from 'mongoose';
const AiInterviewSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, ref: 'Proposal', required: true, unique: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    questions: [
        {
            id: { type: String, required: true },
            question: { type: String, required: true },
            category: { type: String, default: 'technical' }
        }
    ],
    answers: [
        {
            questionId: { type: String, required: true },
            question: { type: String, required: true },
            answerText: { type: String, required: true },
            audioUrl: { type: String },
            answeredAt: { type: Date, default: Date.now }
        }
    ],
    result: {
        score: { type: Number, default: 0 },
        technicalFit: { type: Number, default: 0 },
        communicationScore: { type: Number, default: 0 },
        summary: { type: String },
        strengths: [{ type: String }],
        areasToImprove: [{ type: String }]
    }
}, { timestamps: true });
AiInterviewSchema.index({ proposalId: 1 });
AiInterviewSchema.index({ jobId: 1, freelancerId: 1 });
export default mongoose.model('AiInterview', AiInterviewSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IAiInterviewQuestion {
  id: string;
  question: string;
  category: 'introduction' | 'experience' | 'technical' | 'behavioral';
}

export interface IAiInterviewAnswer {
  questionId: string;
  question: string;
  answerText: string;
  audioUrl?: string;
  answeredAt: Date;
}

export interface IAiInterviewResult {
  score: number;
  technicalFit: number;
  communicationScore: number;
  summary: string;
  strengths: string[];
  areasToImprove: string[];
}

export interface IAiInterview extends Document {
  proposalId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  status: 'pending' | 'in_progress' | 'completed';
  questions: IAiInterviewQuestion[];
  answers: IAiInterviewAnswer[];
  result?: IAiInterviewResult;
  createdAt: Date;
  updatedAt: Date;
}

const AiInterviewSchema = new Schema<IAiInterview>(
  {
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
  },
  { timestamps: true }
);

AiInterviewSchema.index({ proposalId: 1 });
AiInterviewSchema.index({ jobId: 1, freelancerId: 1 });

export default mongoose.model<IAiInterview>('AiInterview', AiInterviewSchema);

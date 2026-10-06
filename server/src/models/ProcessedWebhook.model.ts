import mongoose, { Document, Schema } from 'mongoose';

export interface IProcessedWebhook extends Document {
  gateway: 'flutterwave' | 'paystack' | 'vtstack' | 'stripe';
  eventId?: string;
  reference?: string;
  eventType: string;
  payload?: any;
  status: 'processing' | 'processed' | 'failed';
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessedWebhookSchema: Schema = new Schema(
  {
    gateway: {
      type: String,
      enum: ['flutterwave', 'paystack', 'vtstack', 'stripe'],
      required: true,
    },
    eventId: {
      type: String,
      sparse: true,
      index: true,
    },
    reference: {
      type: String,
      sparse: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['processing', 'processed', 'failed'],
      default: 'processed',
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound indexes for gateway idempotency
ProcessedWebhookSchema.index({ gateway: 1, eventId: 1 }, { unique: true, sparse: true });
ProcessedWebhookSchema.index({ gateway: 1, reference: 1, eventType: 1 }, { unique: true, sparse: true });
ProcessedWebhookSchema.index({ createdAt: -1 });

export default mongoose.model<IProcessedWebhook>('ProcessedWebhook', ProcessedWebhookSchema);

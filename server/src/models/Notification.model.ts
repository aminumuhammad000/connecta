import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'project_started'
  | 'project_completed'
  | 'milestone_completed'
  | 'payment_received'
  | 'payment_released'
  | 'message_received'
  | 'review_received'
  | 'deadline_approaching'
  | 'system';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // Recipient
  type: NotificationType;
  title: string;
  message: string;
  
  // Related entities
  relatedId?: mongoose.Types.ObjectId; // Job, Project, Proposal, etc.
  relatedType?: 'job' | 'project' | 'proposal' | 'message' | 'review' | 'payment';
  
  // Actor (who triggered the notification)
  actorId?: mongoose.Types.ObjectId;
  actorName?: string;
  
  // Metadata
  link?: string; // Frontend URL to navigate to
  icon?: string; // Icon name for display
  priority?: 'low' | 'medium' | 'high';
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'proposal_received',
        'proposal_accepted',
        'proposal_rejected',
        'project_started',
        'project_completed',
        'milestone_completed',
        'payment_received',
        'payment_released',
        'message_received',
        'review_received',
        'deadline_approaching',
        'system',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    relatedType: {
      type: String,
      enum: ['job', 'project', 'proposal', 'message', 'review', 'payment'],
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    actorName: String,
    link: String,
    icon: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

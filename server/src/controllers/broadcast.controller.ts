import { Request, Response } from 'express';
import User from '../models/user.model.js';
import { sendBroadcastEmail } from '../services/email.service.js';

/**
 * Send broadcast email to users
 */
export const sendBroadcast = async (req: Request, res: Response) => {
  try {
    const { recipientType, subject, body, selectedUserIds, individualEmail } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and body are required' 
      });
    }

    let recipients: string[] = [];

    if (recipientType === 'all') {
      const users = await User.find({ isActive: true }, 'email');
      recipients = users.map(u => u.email);
    } else if (recipientType === 'selected') {
      if (!selectedUserIds || !Array.isArray(selectedUserIds)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Selected user IDs are required' 
        });
      }
      const users = await User.find({ _id: { $in: selectedUserIds } }, 'email');
      recipients = users.map(u => u.email);
    } else if (recipientType === 'individual') {
      if (!individualEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Individual email is required' 
        });
      }
      recipients = [individualEmail];
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid recipient type' 
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No recipients found' 
      });
    }

    console.log(`Sending broadcast email to ${recipients.length} recipients`);
    const result = await sendBroadcastEmail(recipients, subject, body);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Broadcast controller error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

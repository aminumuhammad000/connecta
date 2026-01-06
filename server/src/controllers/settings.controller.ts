import { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings.model';
import { verifyEmailConfig } from '../services/email.service';

/**
 * Get system settings
 */
export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await SystemSettings.getSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
};

/**
 * Update SMTP settings
 */
export const updateSmtpSettings = async (req: Request, res: Response) => {
    try {
        const { host, port, user, pass, secure, fromEmail, fromName, provider } = req.body;

        const settings = await SystemSettings.getSettings();

        settings.smtp = {
            provider: provider || 'other',
            host,
            port,
            user,
            pass,
            secure: !!secure,
            fromEmail,
            fromName
        };

        await settings.save();

        // Verify new configuration
        const isVerified = await verifyEmailConfig();

        res.json({
            success: true,
            message: 'SMTP settings updated successfully',
            data: settings,
            isVerified
        });
    } catch (error) {
        console.error('Error updating SMTP settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update SMTP settings'
        });
    }
};

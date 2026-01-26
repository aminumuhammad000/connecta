import { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings.model.js';
import { verifyEmailConfig } from '../services/email.service.js';

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

/**
 * Update API keys settings
 */
export const updateApiKeys = async (req: Request, res: Response) => {
    try {
        const { openrouter, huggingface, google } = req.body;

        const settings = await SystemSettings.getSettings();

        settings.apiKeys = {
            openrouter: openrouter || settings.apiKeys?.openrouter || '',
            huggingface: huggingface || settings.apiKeys?.huggingface || '',
            google: {
                clientId: google?.clientId || settings.apiKeys?.google?.clientId || '',
                clientSecret: google?.clientSecret || settings.apiKeys?.google?.clientSecret || '',
                callbackUrl: google?.callbackUrl || settings.apiKeys?.google?.callbackUrl || ''
            }
        };

        const { ai } = req.body;
        if (ai) {
            settings.ai = {
                provider: ai.provider || settings.ai?.provider || 'openai',
                openaiApiKey: ai.openaiApiKey || settings.ai?.openaiApiKey || '',
                geminiApiKey: ai.geminiApiKey || settings.ai?.geminiApiKey || '',
                model: ai.model || settings.ai?.model || ''
            };
        }

        await settings.save();

        res.json({
            success: true,
            message: 'API keys updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating API keys:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update API keys'
        });
    }
};

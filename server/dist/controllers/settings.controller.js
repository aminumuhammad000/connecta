"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApiKeys = exports.updateSmtpSettings = exports.getSettings = void 0;
const SystemSettings_model_1 = __importDefault(require("../models/SystemSettings.model"));
const email_service_1 = require("../services/email.service");
/**
 * Get system settings
 */
const getSettings = async (req, res) => {
    try {
        const settings = await SystemSettings_model_1.default.getSettings();
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
};
exports.getSettings = getSettings;
/**
 * Update SMTP settings
 */
const updateSmtpSettings = async (req, res) => {
    try {
        const { host, port, user, pass, secure, fromEmail, fromName, provider } = req.body;
        const settings = await SystemSettings_model_1.default.getSettings();
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
        const isVerified = await (0, email_service_1.verifyEmailConfig)();
        res.json({
            success: true,
            message: 'SMTP settings updated successfully',
            data: settings,
            isVerified
        });
    }
    catch (error) {
        console.error('Error updating SMTP settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update SMTP settings'
        });
    }
};
exports.updateSmtpSettings = updateSmtpSettings;
/**
 * Update API keys settings
 */
const updateApiKeys = async (req, res) => {
    try {
        const { openrouter, huggingface, google } = req.body;
        const settings = await SystemSettings_model_1.default.getSettings();
        settings.apiKeys = {
            openrouter: openrouter || settings.apiKeys?.openrouter || '',
            huggingface: huggingface || settings.apiKeys?.huggingface || '',
            google: {
                clientId: google?.clientId || settings.apiKeys?.google?.clientId || '',
                clientSecret: google?.clientSecret || settings.apiKeys?.google?.clientSecret || '',
                callbackUrl: google?.callbackUrl || settings.apiKeys?.google?.callbackUrl || ''
            }
        };
        await settings.save();
        res.json({
            success: true,
            message: 'API keys updated successfully',
            data: settings
        });
    }
    catch (error) {
        console.error('Error updating API keys:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update API keys'
        });
    }
};
exports.updateApiKeys = updateApiKeys;

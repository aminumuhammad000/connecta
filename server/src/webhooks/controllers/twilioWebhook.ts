import { Request, Response } from 'express';
import TwilioService from '../../services/twilio.service.js';
import Profile from '../../models/Profile.model.js';
import axios from 'axios';

/**
 * Handle Twilio WhatsApp Webhook
 */
export const handleTwilioWebhook = async (req: Request, res: Response) => {
    try {
        const { Body, From, ProfileName } = req.body;
        console.log(`📩 WhatsApp received from ${From} (Name: ${ProfileName}): ${Body}`);

        // From format is "whatsapp:+1234567890". Remove prefix to find user.
        const phoneNumber = From.replace('whatsapp:', '');

        // 1. Find User by Phone
        const profile = await Profile.findOne({ phoneNumber }).populate('user');

        if (!profile || !profile.user) {
            console.log(`User not found for phone ${phoneNumber}. Sending generic response.`);
            await TwilioService.sendWhatsAppMessage(From, `Hi ${ProfileName || 'there'}! 👋\n\nWelcome to Connecta. It looks like your phone number isn't linked to a Connecta account yet.\n\nPlease log in to the app and update your profile settings with this phone number to start using the AI Assistant here! 🚀`);
            return res.status(200).send('<Response></Response>'); // TwiML empty response
        }

        const user = profile.user as any;
        console.log(`Found user: ${user.firstName} ${user.lastName} (${user._id})`);

        // 2. Process Message via Standalone Agent Service
        const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL || "http://localhost:5001";
        console.log(`🔀 Proxying WhatsApp message to Agent service: ${AGENT_SERVER_URL}`);

        const agentResponse = await axios.post(`${AGENT_SERVER_URL}/api/agent`, {
            input: Body,
            userId: user._id.toString(),
            userType: user.userType
        }, {
            timeout: 35000
        });

        if (!agentResponse.data || !agentResponse.data.result) {
            throw new Error('Invalid response from Agent service');
        }

        const result = agentResponse.data.result;

        // 3. Send Response
        let responseText = result.message || "";

        // If result has rich data (cards), format it simply for WhatsApp
        if (result.responseType === 'card' && result.data) {
            if (Array.isArray(result.data)) {
                responseText += "\n\n" + result.data.map((item: any) =>
                    `🔹 *${item.title}*\n${item.company ? item.company + '\n' : ''}${item.budget ? '💰 ' + item.budget : ''}\n🔗 https://connecta.app/jobs/${item._id || item.id}`
                ).join('\n\n');
            } else if (result.data.title) {
                responseText += `\n\n📌 *${result.data.title}*\n${result.data.company}\n💰 ${result.data.budget}\n🔗 https://connecta.app/jobs/${result.data._id || result.data.id}`;
            }
        }

        // Append analytics summary if exists
        if (result.responseType === 'analytics' && result.data) {
            responseText += `\n\n📊 *Score:* ${result.data.score || result.data.strength}%`;
            if (result.data.suggestions && result.data.suggestions.length > 0) {
                responseText += `\n💡 Tip: ${result.data.suggestions[0]}`;
            }
        }

        if (!responseText) {
            responseText = "I processed that, but I'm not sure what to say properly. Try asking differently?";
        }

        await TwilioService.sendWhatsAppMessage(From, responseText);

        res.status(200).send('<Response></Response>');
    } catch (error: any) {
        console.error('Twilio Webhook Error:', error.message);
        res.status(500).send('Error');
    }
};

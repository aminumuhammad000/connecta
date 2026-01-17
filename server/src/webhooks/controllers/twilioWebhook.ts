import { Request, Response } from 'express';
import TwilioService from '../../services/twilio.service';
import Profile from '../../models/Profile.model';
import axios from 'axios';
import { ConnectaAgent } from '../../core/ai/connecta-agent/agent';
import { getApiKeys } from '../../services/apiKeys.service';
import User from '../../models/user.model';

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
        // Need to check Profile for phone number match
        const profile = await Profile.findOne({ phoneNumber }).populate('user');

        if (!profile || !profile.user) {
            console.log(`User not found for phone ${phoneNumber}. Sending generic response.`);
            await TwilioService.sendWhatsAppMessage(From, `Hi ${ProfileName || 'there'}! 👋\n\nWelcome to Connecta. It looks like your phone number isn't linked to a Connecta account yet.\n\nPlease log in to the app and update your profile settings with this phone number to start using the AI Assistant here! 🚀`);
            return res.status(200).send('<Response></Response>'); // TwiML empty response
        }

        const user = profile.user as any;
        console.log(`Found user: ${user.firstName} ${user.lastName} (${user._id})`);

        // 2. Initialize Agent for User
        const apiKeys = await getApiKeys();
        const agent = new ConnectaAgent({
            apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5000",
            authToken: "", // Agent handles context via DB now mostly, but tools might need tokens. 
            // Ideally we should generate a temporary token or use internal service calls.
            // For now, let's proceed. The Agent might need bypassing auth for internal calls or we generate one.
            userId: user._id.toString(),
            openaiApiKey: apiKeys.openrouter || process.env.OPENROUTER_API_KEY || "fallback",
            mockMode: false,
            // Prefix conversation ID to separate WA chats
            conversationId: `wa_${user._id}_${new Date().toISOString().split('T')[0]}`
        });

        await agent.initialize();

        // 3. Process Message
        // Send typing indicator (optional, not heavily supported in basic Twilio API but good practice logic)

        const result = await agent.process(Body);

        // 4. Send Response
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
    } catch (error) {
        console.error('Twilio Webhook Error:', error);
        res.status(500).send('Error');
    }
};

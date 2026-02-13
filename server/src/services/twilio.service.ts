import twilio from 'twilio';
import Profile from '../models/Profile.model.js';
import { IJob } from '../models/Job.model.js';

class TwilioService {
    private client: any;
    private whatsappNumber: string;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const apiKey = process.env.TWILIO_API_KEY;
        const apiSecret = process.env.TWILIO_API_SECRET;

        this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default sandbox

        if (apiKey && apiSecret && accountSid) {
            this.client = twilio(apiKey, apiSecret, { accountSid });
        } else if (accountSid && authToken) {
            this.client = twilio(accountSid, authToken);
        } else {
            console.warn("⚠️ Twilio credentials missing. WhatsApp notifications will not work.");
        }
    }

    async sendWhatsAppMessage(to: string, body: string) {
        if (!this.client) return;

        try {
            // Ensure number has 'whatsapp:' prefix
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

            const message = await this.client.messages.create({
                from: this.whatsappNumber,
                to: formattedTo,
                body
            });

            console.log(`✅ WhatsApp sent to ${to}: ${message.sid}`);
            return message;
        } catch (error) {
            console.error(`❌ Failed to send WhatsApp to ${to}:`, error);
        }
    }

    async notifyMatchingFreelancers(job: IJob) {
        if (!this.client) return;

        try {
            // Find freelancers with matching skills or category
            // And who have a phone number
            const query = {
                phoneNumber: { $exists: true, $ne: '' },
                $or: [
                    { skills: { $in: job.skills || [] } },
                    { jobCategories: job.category }
                ]
            };

            const profiles = await Profile.find(query)
                .select('phoneNumber user jobNotificationFrequency')
                .populate('user', 'isSubscribedToGigs firstName');

            if (profiles.length === 0) {
                console.log(`ℹ️ No matching freelancers with phone numbers found for job: ${job.title}`);
                return;
            }

            // Filter out users who have unsubscribed or set frequency to non-instant
            const eligibleProfiles = profiles.filter((p: any) => {
                const user = p.user;
                if (!user || user.isSubscribedToGigs === false) return false;

                // If frequency is explicitly set to 'daily' or 'weekly', skip instant alert
                // (Assuming we'd have a cron job for those)
                if (['daily', 'weekly'].includes(p.jobNotificationFrequency)) return false;

                return true;
            });

            if (eligibleProfiles.length === 0) {
                console.log(`ℹ️ Matching freelancers found, but none eligible for instant WhatsApp (preferences/unsubscribed).`);
                return;
            }

            console.log(`📣 Notifying ${eligibleProfiles.length} freelancers about job: ${job.title}`);



            // Construct message
            const budgetText = typeof job.budget === 'object'
                ? `${(job.budget as any).currency}${(job.budget as any).amount}`
                : job.budget;

            const messageBody = `🚀 *New Gig Alert!*\n\n*${job.title}*\n🏢 ${job.company}\n💰 ${budgetText || 'Negotiable'}\n📍 ${job.locationType}\n\nApply now: https://connecta.app/jobs/${job._id}`;

            // Send messages (in parallel, be careful with rate limits in prod)
            await Promise.all(eligibleProfiles.map((p: any) => {
                if (p.phoneNumber) {
                    // personalize if possible
                    // const name = p.user?.firstName || 'Freelancer';
                    return this.sendWhatsAppMessage(p.phoneNumber, messageBody);
                }
            }));

        } catch (error) {
            console.error("Error notifying freelancers:", error);
        }
    }
}

export default new TwilioService();

import { BaseTool } from "./base.tool.js";

/**
 * Get Support Contact Information
 * Returns Connecta support contact details
 */
export class GetSupportTool extends BaseTool {
    name = "get_support_tool";
    description = "Get Connecta support contact information when user needs help beyond AI capabilities or wants to contact support team.";

    async _call(_args: any): Promise<any> {
        return {
            success: true,
            message: "Here's how to contact Connecta support:",
            data: {
                email: "info@myconnecta.ng",
                phone: "07070249434",
                whatsapp: "08100015498",
            },
            formatted: `📞 **Contact Connecta Support**

📧 **Email:** info@myconnecta.ng
📱 **Phone:** 07070249434  
💬 **WhatsApp:** 08100015498

Our support team is here to help!`,
        };
    }
}

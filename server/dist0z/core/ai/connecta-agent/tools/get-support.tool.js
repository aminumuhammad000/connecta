"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSupportTool = void 0;
const base_tool_1 = require("./base.tool");
/**
 * Get Support Contact Information
 * Returns Connecta support contact details
 */
class GetSupportTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_support_tool";
        this.description = "Get Connecta support contact information when user needs help beyond AI capabilities or wants to contact support team.";
    }
    async _call(_args) {
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
exports.GetSupportTool = GetSupportTool;

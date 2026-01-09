"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_service_1 = require("../services/email.service");
const db_config_1 = __importDefault(require("../config/db.config"));
dotenv_1.default.config();
const testBroadcastEmail = async () => {
    try {
        // Connect to database
        await (0, db_config_1.default)();
        console.log('Connected to database');
        const testEmail = 'aminumuhammad00015@gmail.com';
        const subject = 'Test Broadcast Email';
        const html = `
      <h1>Broadcast Test</h1>
      <p>This is a test email to verify the broadcast email functionality.</p>
      <p>If you received this, the email service is working correctly.</p>
    `;
        const text = 'This is a test email to verify the broadcast email functionality.';
        console.log(`Sending test email to ${testEmail}...`);
        const result = await (0, email_service_1.sendEmail)(testEmail, subject, html, text);
        if (result.success) {
            console.log('✅ Test email sent successfully!');
        }
        else {
            console.error('❌ Failed to send test email:', result.error);
        }
    }
    catch (error) {
        console.error('❌ Error running test:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from database');
        process.exit(0);
    }
};
testBroadcastEmail();

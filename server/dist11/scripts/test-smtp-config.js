"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const SystemSettings_model_1 = __importDefault(require("../models/SystemSettings.model"));
const email_service_1 = require("../services/email.service");
dotenv_1.default.config();
const testSMTP = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta');
        console.log('Connected to MongoDB');
        // Test 1: Set provider to 'other' (mock)
        console.log('\n--- Testing "Other" Provider ---');
        await SystemSettings_model_1.default.findOneAndUpdate({}, {
            smtp: {
                provider: 'other',
                host: 'smtp.ethereal.email',
                port: 587,
                user: 'test_user',
                pass: 'test_pass',
                secure: false,
                fromEmail: 'test@example.com',
                fromName: 'Test Sender'
            }
        }, { upsert: true });
        // We expect this to fail authentication with fake creds, but it confirms the "other" path is taken
        // In a real scenario, we'd use a real Ethereal account, but for now we just want to see it tries to connect
        let result = await (0, email_service_1.sendEmail)('recipient@example.com', 'Test Subject', '<p>Test Body</p>');
        console.log('Result (Other):', result.success ? 'Success' : 'Failed as expected (invalid creds)');
        if (!result.success && result.error.includes('Invalid login')) {
            console.log('Confirmed: Attempted to connect to smtp.ethereal.email');
        }
        // Test 2: Set provider to 'gmail'
        console.log('\n--- Testing "Gmail" Provider ---');
        await SystemSettings_model_1.default.findOneAndUpdate({}, {
            smtp: {
                provider: 'gmail',
                user: 'test_gmail_user@gmail.com',
                pass: 'test_app_password', // Invalid, so expecting auth failure
                fromEmail: 'test_gmail_user@gmail.com',
                fromName: 'Gmail Sender'
            }
        }, { upsert: true });
        result = await (0, email_service_1.sendEmail)('recipient@example.com', 'Test Subject', '<p>Test Body</p>');
        console.log('Result (Gmail):', result.success ? 'Success' : 'Failed as expected (invalid creds)');
        if (!result.success && (result.error.includes('Username and Password not accepted') || result.error.includes('Invalid login'))) {
            console.log('Confirmed: Attempted to connect via Gmail service');
        }
        console.log('\nTests Completed');
    }
    catch (error) {
        console.error('Test Error:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
};
testSMTP();

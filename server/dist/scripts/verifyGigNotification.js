"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Starting verification script...");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../models/user.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const Job_model_1 = __importDefault(require("../models/Job.model"));
const Job_controller_1 = require("../controllers/Job.controller");
dotenv_1.default.config();
const verifyGigNotification = async () => {
    try {
        // Connect to DB
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        // 1. Create a test freelancer
        const testFreelancerEmail = `test_freelancer_${Date.now()}@example.com`;
        const testFreelancer = await user_model_1.default.create({
            firstName: "Test",
            lastName: "Freelancer",
            email: testFreelancerEmail,
            password: "password123",
            userType: "freelancer",
            isSubscribedToGigs: true,
        });
        console.log(`Created test freelancer: ${testFreelancer.email}`);
        // 2. Create a profile for the freelancer with skills
        await Profile_model_1.default.create({
            user: testFreelancer._id,
            skills: ["React", "Node.js"],
        });
        console.log("Created profile with skills: React, Node.js");
        // 3. Mock Request and Response for createJob
        const req = {
            body: {
                title: "Senior React Developer",
                company: "Tech Corp",
                location: "Remote",
                description: "We are looking for a React expert.",
                skills: ["React"],
                experience: "Senior",
                category: "Web Development",
                clientId: new mongoose_1.default.Types.ObjectId(), // Mock client ID
            },
            user: { _id: new mongoose_1.default.Types.ObjectId() }, // Mock logged in client
        };
        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Job creation response status: ${code}`);
                    console.log("Job creation response data:", data);
                },
            }),
        };
        // 4. Call createJob controller
        console.log("Calling createJob controller...");
        await (0, Job_controller_1.createJob)(req, res);
        // Wait for async notification logic
        console.log("Waiting for notification logic...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // 5. Cleanup
        await user_model_1.default.findByIdAndDelete(testFreelancer._id);
        await Profile_model_1.default.findOneAndDelete({ user: testFreelancer._id });
        // Note: Job cleanup is tricky without ID from response, but for test DB it's okay-ish or we can query by title
        await Job_model_1.default.findOneAndDelete({ title: "Senior React Developer" });
        console.log("Verification complete. Check logs for 'Gig notification email sent' message.");
        process.exit(0);
    }
    catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
};
verifyGigNotification();

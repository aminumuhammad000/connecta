console.log("Starting verification script...");
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import Profile from "../models/Profile.model";
import Job from "../models/Job.model";
import { createJob } from "../controllers/Job.controller";
dotenv.config();
const verifyGigNotification = async () => {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        // 1. Create a test freelancer
        const testFreelancerEmail = `test_freelancer_${Date.now()}@example.com`;
        const testFreelancer = await User.create({
            firstName: "Test",
            lastName: "Freelancer",
            email: testFreelancerEmail,
            password: "password123",
            userType: "freelancer",
            isSubscribedToGigs: true,
        });
        console.log(`Created test freelancer: ${testFreelancer.email}`);
        // 2. Create a profile for the freelancer with skills
        await Profile.create({
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
                clientId: new mongoose.Types.ObjectId(), // Mock client ID
            },
            user: { _id: new mongoose.Types.ObjectId() }, // Mock logged in client
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
        await createJob(req, res);
        // Wait for async notification logic
        console.log("Waiting for notification logic...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // 5. Cleanup
        await User.findByIdAndDelete(testFreelancer._id);
        await Profile.findOneAndDelete({ user: testFreelancer._id });
        // Note: Job cleanup is tricky without ID from response, but for test DB it's okay-ish or we can query by title
        await Job.findOneAndDelete({ title: "Senior React Developer" });
        console.log("Verification complete. Check logs for 'Gig notification email sent' message.");
        process.exit(0);
    }
    catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
};
verifyGigNotification();

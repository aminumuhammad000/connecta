import mongoose from "mongoose";
import User from "../src/models/user.model";
import Profile from "../src/models/Profile.model";
import Job from "../src/models/Job.model";
import { RecommendationService } from "../src/services/recommendation.service";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/connecta";

async function runVerification() {
    try {
        console.log("Connecting to MongoDB...", MONGODB_URI);
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected to MongoDB");

        // 1. Create a dummy user
        const userEmail = `testuser_${Date.now()}@example.com`;
        const user = await User.create({
            firstName: "Test",
            lastName: "User",
            email: userEmail,
            password: "password123",
            userType: "freelancer",
        });
        console.log(`Created user: ${user._id}`);

        // 2. Create a profile with specific skills
        await Profile.create({
            user: user._id,
            skills: ["React", "TypeScript", "Node.js"],
            bio: "Experienced Full Stack Developer specializing in MERN stack.",
        });
        console.log("Created user profile with skills: React, TypeScript, Node.js");

        // 3. Create dummy jobs
        const client = await User.findOne({ userType: "client" });
        const clientId = client ? client._id : user._id; // Fallback if no client exists

        const job1 = await Job.create({
            title: "React Developer Needed",
            description: "We are looking for a React developer with TypeScript experience.",
            skills: ["React", "TypeScript"],
            clientId,
            location: "Remote",
            experience: "Intermediate",
            category: "Development",
            company: "Tech Corp",
        });

        const job2 = await Job.create({
            title: "Data Entry Specialist",
            description: "Need someone to enter data into Excel sheets.",
            skills: ["Excel", "Data Entry"],
            clientId,
            location: "Remote",
            experience: "Entry",
            category: "Admin",
            company: "Data Inc",
        });

        console.log(`Created Job 1 (Relevant): ${job1._id}`);
        console.log(`Created Job 2 (Irrelevant): ${job2._id}`);

        // 4. Get Recommendations
        const service = new RecommendationService();
        const recommendations = await service.getRecommendationsForUser(user._id.toString());

        console.log("\nRecommendations:");
        recommendations.forEach((job, index) => {
            console.log(`${index + 1}. ${job.title} (Score: ${(job as any).matchScore})`);
        });

        // 5. Cleanup
        await User.findByIdAndDelete(user._id);
        await Profile.findOneAndDelete({ user: user._id });
        await Job.findByIdAndDelete(job1._id);
        await Job.findByIdAndDelete(job2._id);

        console.log("\nCleanup complete");

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();

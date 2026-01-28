import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import LLMService from '../services/LLM.service.js';
import CollaboService from '../services/Collabo.service.js';
import User from '../models/user.model.js';

dotenv.config();

const run = async () => {
    await connectDB();

    console.log("--- Testing LLM Scoping ---");
    const description = "Build a mobile app for food delivery";
    try {
        const scope = await LLMService.scopeProject(description);
        console.log("Scope Result:", JSON.stringify(scope, null, 2));

        if (!scope.roles || scope.roles.length === 0) {
            console.error("❌ Scoping returned empty roles!");
        } else {
            console.log("✅ Scoping returned roles.");
        }

        console.log("--- Testing Project Creation ---");
        const user = await User.findOne();
        if (!user) {
            console.error("❌ No user found to test creation.");
            return;
        }
        console.log("Using user:", user._id);

        const projectData = {
            title: "Test Project",
            description: "Test Description",
            totalBudget: scope.totalEstimatedBudget || 1000,
            roles: scope.roles || [],
            milestones: scope.milestones || [],
            recommendedStack: scope.recommendedStack || [],
            risks: scope.risks || [],
            category: "Tech",
            niche: "Mobile",
            projectType: "one-time",
            scope: "local",
            duration: "3",
            durationType: "months"
        };

        const result = await CollaboService.createCollaboProject(user._id.toString(), projectData);
        console.log("✅ Project Created:", result.project._id);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();

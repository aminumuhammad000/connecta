// Seed script to create sample testimonials/reviews for testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../src/models/Review.model.js';
import User from '../src/models/user.model.js';
import connectDB from '../src/config/db.config.js';

dotenv.config();

const sampleReviews = [
    {
        comment: "Connecta changed how I freelance. The 'Collabo' workspace is a game changer for remote teams. It feels like we are in the same room!",
        rating: 5,
        reviewerType: 'client',
        tags: ['Professional', 'Great Communication', 'On Time']
    },
    {
        comment: "Finally, a platform that doesn't just treat us like numbers. The community vibe and AI matching are spot on. Highly recommended!",
        rating: 5,
        reviewerType: 'freelancer',
        tags: ['Excellent Quality', 'Responsive', 'Innovative']
    },
    {
        comment: "I hired a full dev team in 24 hours using Connecta AI. The quality of talent here is unmatched compared to other platforms.",
        rating: 5,
        reviewerType: 'client',
        tags: ['Fast Delivery', 'High Quality', 'Professional']
    },
    {
        comment: "The AI-powered matching saved me hours of searching. Found the perfect freelancer for my project within minutes!",
        rating: 5,
        reviewerType: 'client',
        tags: ['Time Saver', 'Great Match', 'Easy to Use']
    },
    {
        comment: "Best freelancing platform I've used. The payment system is secure and the project management tools are top-notch.",
        rating: 4,
        reviewerType: 'freelancer',
        tags: ['Secure Payments', 'Great Tools', 'User Friendly']
    },
    {
        comment: "Connecta's support team is incredibly helpful. They resolved my issues quickly and professionally.",
        rating: 5,
        reviewerType: 'client',
        tags: ['Excellent Support', 'Quick Response', 'Professional']
    }
];

async function seedReviews() {
    try {
        await connectDB();
        console.log('✅ Connected to database');

        // Find or create sample users
        const users = await User.find().limit(10);

        if (users.length < 2) {
            console.log('❌ Not enough users in database. Please create some users first.');
            process.exit(1);
        }

        // Clear existing reviews (optional - comment out if you want to keep existing reviews)
        // await Review.deleteMany({});
        // console.log('🗑️  Cleared existing reviews');

        // Create sample reviews
        const createdReviews = [];
        for (let i = 0; i < sampleReviews.length; i++) {
            const sample = sampleReviews[i];
            const reviewerIndex = i % users.length;
            const revieweeIndex = (i + 1) % users.length;

            const review = await Review.create({
                reviewerId: users[reviewerIndex]._id,
                revieweeId: users[revieweeIndex]._id,
                reviewerType: sample.reviewerType,
                rating: sample.rating,
                comment: sample.comment,
                tags: sample.tags,
                isPublic: true,
                isFlagged: false,
                helpfulCount: Math.floor(Math.random() * 20) + 5, // Random helpful count
            });

            createdReviews.push(review);
            console.log(`✅ Created review ${i + 1}/${sampleReviews.length}`);
        }

        console.log(`\n🎉 Successfully seeded ${createdReviews.length} testimonials!`);
        console.log('\n📊 Sample data:');
        console.log(`   - Total reviews: ${createdReviews.length}`);
        console.log(`   - Average rating: ${(createdReviews.reduce((sum, r) => sum + r.rating, 0) / createdReviews.length).toFixed(1)}`);
        console.log(`   - 5-star reviews: ${createdReviews.filter(r => r.rating === 5).length}`);
        console.log(`   - 4-star reviews: ${createdReviews.filter(r => r.rating === 4).length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
        process.exit(1);
    }
}

seedReviews();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.config';
import User from '../src/models/user.model';
import Conversation from '../src/models/Conversation.model';
import Message from '../src/models/Message.model';

dotenv.config();

const seedMessages = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Clear existing data
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    console.log('✅ Cleared existing messages and conversations');

    // Find or create users
    let freelancer = await User.findOne({ email: 'freelancer@connecta.com' });
    if (!freelancer) {
      freelancer = await User.create({
        firstName: 'John',
        lastName: 'Freelancer',
        email: 'freelancer@connecta.com',
        password: 'password123',
        userType: 'freelancer',
      });
    }

    let client = await User.findOne({ email: 'mustapha@client.com' });
    if (!client) {
      client = await User.create({
        firstName: 'Mustapha',
        lastName: 'Hussein',
        email: 'mustapha@client.com',
        password: 'password123',
        userType: 'employer',
      });
    }

    console.log('✅ Users ready:', {
      freelancer: freelancer._id,
      client: client._id,
    });

    const freelancerId = (freelancer._id as mongoose.Types.ObjectId).toString();
    const clientId = (client._id as mongoose.Types.ObjectId).toString();

    // Create conversation
    const conversation = await Conversation.create({
      participants: [freelancer._id, client._id],
      lastMessage: "I'll be right out. Thanks for coming early!",
      lastMessageAt: new Date(),
      unreadCount: new Map([
        [freelancerId, 0],
        [clientId, 0],
      ]),
    });

    console.log('✅ Conversation created:', conversation._id);

    const conversationId = (conversation._id as mongoose.Types.ObjectId).toString();

    // Create sample messages
    const messages = [
      {
        conversationId,
        senderId: freelancer._id,
        receiverId: client._id,
        text: 'Hello! I wanted to discuss the project requirements with you.',
        isRead: true,
        readAt: new Date('2025-10-28T08:16:00'),
        createdAt: new Date('2025-10-28T08:15:00'),
      },
      {
        conversationId,
        senderId: client._id,
        receiverId: freelancer._id,
        text: "Hi! Sure, I'm available now. What would you like to know?",
        isRead: true,
        readAt: new Date('2025-10-28T08:17:00'),
        createdAt: new Date('2025-10-28T08:16:00'),
      },
      {
        conversationId,
        senderId: freelancer._id,
        receiverId: client._id,
        text: 'I have a few questions about the design specifications.',
        isRead: true,
        readAt: new Date('2025-10-28T08:18:00'),
        createdAt: new Date('2025-10-28T08:17:00'),
      },
      {
        conversationId,
        senderId: client._id,
        receiverId: freelancer._id,
        text: 'Of course! The design should follow our brand guidelines. I can share the style guide with you.',
        isRead: true,
        readAt: new Date('2025-10-28T08:20:00'),
        createdAt: new Date('2025-10-28T08:19:00'),
      },
      {
        conversationId,
        senderId: freelancer._id,
        receiverId: client._id,
        text: 'That would be great! Also, what is the expected timeline for the first draft?',
        isRead: true,
        readAt: new Date('2025-10-28T08:22:00'),
        createdAt: new Date('2025-10-28T08:21:00'),
      },
      {
        conversationId,
        senderId: client._id,
        receiverId: freelancer._id,
        text: "We're hoping to have the first draft by the end of next week. Does that work for you?",
        isRead: true,
        readAt: new Date('2025-10-28T08:24:00'),
        createdAt: new Date('2025-10-28T08:23:00'),
      },
      {
        conversationId,
        senderId: freelancer._id,
        receiverId: client._id,
        text: 'Yes, that timeline works perfectly! I can definitely have something ready by then.',
        isRead: true,
        readAt: new Date('2025-10-28T08:26:00'),
        createdAt: new Date('2025-10-28T08:25:00'),
      },
      {
        conversationId,
        senderId: client._id,
        receiverId: freelancer._id,
        text: 'Excellent! Looking forward to seeing your work. Let me know if you need anything else.',
        isRead: false,
        createdAt: new Date('2025-10-28T08:27:00'),
      },
    ];

    await Message.insertMany(messages);
    console.log('✅ Successfully seeded 8 messages');

    console.log('\n📊 Summary:');
    console.log(`- Freelancer ID: ${freelancer._id}`);
    console.log(`- Client ID: ${client._id}`);
    console.log(`- Conversation ID: ${conversation._id}`);
    console.log('- Messages: 8');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding messages:', error);
    process.exit(1);
  }
};

seedMessages();

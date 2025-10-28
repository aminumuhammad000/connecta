import mongoose from 'mongoose';
import Conversation from '../src/models/Conversation.model';
import Message from '../src/models/Message.model';
import '../src/config/db.config';

async function checkConversations() {
  try {
    console.log('Checking conversations in database...\n');

    const conversations = await Conversation.find({})
      .populate('participants', 'firstName lastName email')
      .populate('projectId', 'title');

    console.log(`Total conversations: ${conversations.length}\n`);

    for (const conv of conversations) {
      console.log('Conversation ID:', conv._id);
      console.log('Participants:', conv.participants.map((p: any) => `${p.firstName} ${p.lastName}`).join(', '));
      console.log('Project:', conv.projectId ? conv.projectId.title : 'None');
      
      // Get message count
      const messageCount = await Message.countDocuments({ conversationId: conv._id });
      console.log('Messages:', messageCount);
      
      // Get last message
      const lastMessage = await Message.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 })
        .limit(1);
      
      if (lastMessage) {
        console.log('Last message:', lastMessage.text.substring(0, 50));
        console.log('Last message time:', lastMessage.createdAt);
      }
      
      console.log('---\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkConversations();

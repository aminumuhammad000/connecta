import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/user.model.js';
import Profile from '../models/Profile.model.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { messages, message } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Fetch live user details & profile context
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profile = await Profile.findOne({ user: userId });

    const isClient = user.userType === 'client';
    const userName = `${user.firstName} ${user.lastName}`;
    const userRole = isClient ? 'Client' : 'Freelancer';
    const title = user.title || (profile as any)?.jobTitle || (isClient ? 'Project Manager / Client' : 'Software Specialist');
    const company = user.companyName || (profile as any)?.companyName || 'Connecta Organization';
    const skills = (user.skills && user.skills.length > 0) ? user.skills.join(', ') : 'Software Development, UI/UX, Mobile Apps';
    const location = user.location || 'Nigeria';

    // 2. Build personalized System Prompt with user's real account context
    const systemPrompt = `You are Connecta AI Copilot, the intelligent personal assistant built directly into the Connecta Freelance & Remote Jobs Marketplace.

You are assisting:
- User Name: ${userName}
- Account Type: ${userRole}
- Title / Occupation: ${title}
- Company / Organization: ${company}
- Key Skills: ${skills}
- Location: ${location}

GUIDELINES FOR YOUR RESPONSES:
1. Always address ${user.firstName} naturally and personalize your answers based on whether they are a ${userRole} or Freelancer.
2. If ${user.firstName} is a Client, assist them with drafting compelling job descriptions, setting milestone budgets, evaluating proposals, and hiring top vetted talent on Connecta.
3. If ${user.firstName} is a Freelancer, assist them with writing high-converting proposal pitches, negotiating rates, crafting professional resumes/bios, and finding high-paying contracts.
4. Keep answers concise, highly practical, formatted with bold text and bullet points where helpful. Mention Connecta Escrow, Connecta Sparks, and Connecta Vetted Pro features when relevant.`;

    // 3. Prepare OpenAI Messages format
    const formattedMessages = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((m: any) => {
        if (m.sender && m.text) {
          formattedMessages.push({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          });
        } else if (m.role && m.content) {
          formattedMessages.push({
            role: m.role,
            content: m.content
          });
        }
      });
    } else if (message) {
      formattedMessages.push({ role: 'user', content: message });
    }

    // 4. Send request to OpenAI Chat Completion API
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 850,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) {
        return res.status(200).json({
          success: true,
          data: {
            reply,
            userContext: {
              name: userName,
              userType: user.userType,
              title,
            }
          }
        });
      }
    } catch (openAiError: any) {
      console.warn('OpenAI Direct Call Warning:', openAiError?.response?.data || openAiError.message);
    }

    // Fallback smart personalized response if OpenAI API key has quota/rate limits
    const lastUserMsg = message || (Array.isArray(messages) ? messages[messages.length - 1]?.text : '') || 'Connecta AI query';
    let fallbackReply = `Hello ${user.firstName}! I am your Connecta AI Copilot. `;
    
    if (isClient) {
      fallbackReply += `As a ${userRole} managing projects at ${company}, here is my advice regarding "${lastUserMsg}":\n\n` +
        `1. **Project Scope**: Be clear about deliverables and milestone deadlines.\n` +
        `2. **Escrow Security**: Always fund milestones upfront in Connecta Escrow so top talent bids on your post.\n` +
        `3. **Vetted Talent**: Review candidate work experience and skill scores before hiring.`;
    } else {
      fallbackReply += `As a ${title} (${skills}), here is my guidance regarding "${lastUserMsg}":\n\n` +
        `1. **Winning Pitch**: Highlight your specific experience with ${skills.split(',')[0] || 'relevant tech'}.\n` +
        `2. **Milestones**: Propose structured delivery milestones matching the client's goals.\n` +
        `3. **Escrow Guarantee**: Ensure milestones are activated in escrow before starting work.`;
    }

    return res.status(200).json({
      success: true,
      data: {
        reply: fallbackReply,
        userContext: {
          name: userName,
          userType: user.userType,
          title,
        }
      }
    });

  } catch (err: any) {
    console.error('AI Controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error in AI Copilot service',
      error: err.message
    });
  }
};

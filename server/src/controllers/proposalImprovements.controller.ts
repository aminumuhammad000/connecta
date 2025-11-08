import { Request, Response } from 'express';
import Proposal from '../models/Proposal.model';
import ProposalTemplate from '../models/ProposalTemplate.model';
import { createNotification } from './notification.controller';

/**
 * Edit existing proposal (before accepted)
 */
export const editProposal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { proposalId } = req.params;
    const { title, description, coverLetter, budget, dateRange, level } = req.body;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Only freelancer can edit their own proposal
    if (proposal.freelancerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Can only edit pending proposals
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit pending proposals',
      });
    }

    // Track changes
    const changes: string[] = [];
    if (title && title !== proposal.title) {
      changes.push(`Title changed from "${proposal.title}" to "${title}"`);
      proposal.title = title;
    }
    if (description && description !== proposal.description) {
      changes.push('Description updated');
      proposal.description = description;
    }
    if (coverLetter) {
      proposal.coverLetter = coverLetter;
      proposal.isCustomized = true;
      changes.push('Cover letter updated');
    }
    if (budget) {
      changes.push(`Budget changed from ${proposal.budget.amount} to ${budget.amount}`);
      proposal.budget = budget;
    }
    if (dateRange) {
      proposal.dateRange = dateRange;
      changes.push('Timeline updated');
    }
    if (level) proposal.level = level;

    // Add to edit history
    if (changes.length > 0) {
      if (!proposal.editHistory) proposal.editHistory = [];
      proposal.editHistory.push({
        editedAt: new Date(),
        changes: changes.join(', '),
      });
      proposal.lastEditedAt = new Date();
    }

    await proposal.save();

    return res.status(200).json({
      success: true,
      message: 'Proposal updated successfully',
      data: proposal,
    });
  } catch (error: any) {
    console.error('Edit proposal error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to edit proposal',
    });
  }
};

/**
 * Withdraw proposal
 */
export const withdrawProposal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { proposalId } = req.params;
    const { reason } = req.body;

    const proposal = await Proposal.findById(proposalId).populate('clientId', 'firstName lastName');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Only freelancer can withdraw
    if (proposal.freelancerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Can only withdraw pending proposals
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending proposals',
      });
    }

    proposal.status = 'withdrawn';
    proposal.withdrawnAt = new Date();
    proposal.withdrawalReason = reason;
    await proposal.save();

    // Notify client if exists
    if (proposal.clientId) {
      await createNotification({
        userId: proposal.clientId._id,
        type: 'system',
        title: 'Proposal Withdrawn',
        message: `A freelancer withdrew their proposal for "${proposal.title}"`,
        relatedId: proposal._id,
        relatedType: 'proposal',
        icon: 'mdi:close-circle',
        priority: 'medium',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Proposal withdrawn successfully',
      data: proposal,
    });
  } catch (error: any) {
    console.error('Withdraw proposal error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to withdraw proposal',
    });
  }
};

/**
 * Create counter-offer
 */
export const createCounterOffer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { proposalId } = req.params;
    const { amount, message } = req.body;

    const proposal = await Proposal.findById(proposalId)
      .populate('clientId', 'firstName lastName')
      .populate('freelancerId', 'firstName lastName');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Determine who is making the counter-offer
    const isClient = proposal.clientId && proposal.clientId._id.toString() === userId;
    const isFreelancer = proposal.freelancerId.toString() === userId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Can only counter-offer on pending proposals
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only counter-offer on pending proposals',
      });
    }

    const counterOffer = {
      amount,
      message,
      offeredBy: isClient ? 'client' as const : 'freelancer' as const,
      offeredAt: new Date(),
      status: 'pending' as const,
    };

    if (!proposal.counterOffers) proposal.counterOffers = [];
    proposal.counterOffers.push(counterOffer);
    await proposal.save();

    // Notify the other party
    const notifyUserId = isClient ? proposal.freelancerId._id : proposal.clientId!._id;
    const notifyUserType = isClient ? 'freelancer' : 'client';

    await createNotification({
      userId: notifyUserId,
      type: 'system',
      title: '💰 Counter-Offer Received',
      message: `You received a counter-offer of ${amount} for "${proposal.title}"`,
      relatedId: proposal._id,
      relatedType: 'proposal',
      link: `/${notifyUserType}/proposals/${proposal._id}`,
      icon: 'mdi:cash-multiple',
      priority: 'high',
    });

    return res.status(201).json({
      success: true,
      message: 'Counter-offer created successfully',
      data: proposal,
    });
  } catch (error: any) {
    console.error('Create counter-offer error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create counter-offer',
    });
  }
};

/**
 * Respond to counter-offer
 */
export const respondToCounterOffer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { proposalId, offerIndex } = req.params;
    const { accept } = req.body; // true or false

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (!proposal.counterOffers || !proposal.counterOffers[Number(offerIndex)]) {
      return res.status(404).json({ success: false, message: 'Counter-offer not found' });
    }

    const counterOffer = proposal.counterOffers[Number(offerIndex)];

    // Verify user is the recipient
    const isClient = proposal.clientId && proposal.clientId.toString() === userId;
    const isFreelancer = proposal.freelancerId.toString() === userId;

    if (
      (counterOffer.offeredBy === 'client' && !isFreelancer) ||
      (counterOffer.offeredBy === 'freelancer' && !isClient)
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update counter-offer status
    counterOffer.status = accept ? 'accepted' : 'declined';

    // If accepted, update proposal budget
    if (accept) {
      proposal.budget.amount = counterOffer.amount;
    }

    await proposal.save();

    return res.status(200).json({
      success: true,
      message: `Counter-offer ${accept ? 'accepted' : 'declined'}`,
      data: proposal,
    });
  } catch (error: any) {
    console.error('Respond to counter-offer error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to counter-offer',
    });
  }
};

/**
 * Create proposal template
 */
export const createProposalTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { name, description, coverLetter, priceType, defaultBudget, defaultTimeline, tags } = req.body;

    const template = await ProposalTemplate.create({
      userId,
      name,
      description,
      coverLetter,
      priceType,
      defaultBudget,
      defaultTimeline,
      tags,
      isPublic: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create template',
    });
  }
};

/**
 * Get user's proposal templates
 */
export const getProposalTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    const templates = await ProposalTemplate.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch templates',
    });
  }
};

/**
 * Use template to create proposal
 */
export const useTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { templateId } = req.params;
    const customizations = req.body; // Any custom overrides

    const template = await ProposalTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Verify ownership
    if (template.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    // Return template data with customizations
    const proposalData = {
      ...customizations,
      coverLetter: customizations.coverLetter || template.coverLetter,
      priceType: customizations.priceType || template.priceType,
      budget: customizations.budget || template.defaultBudget,
      templateId: template._id,
      isCustomized: !!customizations.coverLetter,
    };

    return res.status(200).json({
      success: true,
      message: 'Template loaded successfully',
      data: proposalData,
    });
  } catch (error: any) {
    console.error('Use template error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to use template',
    });
  }
};

/**
 * Delete proposal template
 */
export const deleteProposalTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { templateId } = req.params;

    const template = await ProposalTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (template.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await template.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete template',
    });
  }
};

/**
 * Handle expired proposals (cron job or manual trigger)
 */
export const handleExpiredProposals = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const expiredProposals = await Proposal.updateMany(
      {
        status: 'pending',
        expiresAt: { $lte: now },
      },
      {
        $set: { status: 'expired' },
      }
    );

    return res.status(200).json({
      success: true,
      message: `${expiredProposals.modifiedCount} proposals marked as expired`,
      count: expiredProposals.modifiedCount,
    });
  } catch (error: any) {
    console.error('Handle expired proposals error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to handle expired proposals',
    });
  }
};

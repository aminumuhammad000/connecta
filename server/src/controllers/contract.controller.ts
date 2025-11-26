import { Request, Response } from 'express';
import Contract from '../models/Contract.model';
import Project from '../models/Project.model';
import { createNotification } from './notification.controller';

/**
 * Create a new contract
 */
export const createContract = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const {
      projectId,
      jobId,
      freelancerId,
      title,
      description,
      contractType,
      terms,
      customTerms,
      budget,
      startDate,
      endDate,
      estimatedHours,
      deliverables,
    } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify user is the client
    if (project.clientId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only client can create contract' });
    }

    // Create contract
    const contract = await Contract.create({
      projectId,
      jobId,
      clientId: userId,
      freelancerId,
      title,
      description,
      contractType,
      terms,
      customTerms,
      budget,
      startDate,
      endDate,
      estimatedHours,
      deliverables,
      status: 'pending_signatures',
    });

    // Notify freelancer
    await createNotification({
      userId: freelancerId,
      type: 'system',
      title: '📄 New Contract',
      message: `${project.clientName || 'Client'} sent you a contract for "${title}"`,
      relatedId: contract._id,
      relatedType: 'project',
      link: `/freelancer/contracts/${contract._id}`,
      icon: 'mdi:file-document',
      priority: 'high',
    });

    return res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: contract,
    });
  } catch (error: any) {
    console.error('Create contract error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create contract',
    });
  }
};

/**
 * Get contract by ID
 */
export const getContractById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId)
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .populate('projectId', 'title description');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Verify user is part of the contract
    if (
      contract.clientId._id.toString() !== userId &&
      contract.freelancerId._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    return res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error: any) {
    console.error('Get contract error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch contract',
    });
  }
};

/**
 * Get contracts for a user
 */
export const getUserContracts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {
      $or: [{ clientId: userId }, { freelancerId: userId }],
    };

    if (status) {
      query.status = status;
    }

    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('clientId', 'firstName lastName')
      .populate('freelancerId', 'firstName lastName')
      .populate('projectId', 'title');

    const total = await Contract.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: contracts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get user contracts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch contracts',
    });
  }
};

/**
 * Sign contract
 */
export const signContract = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { contractId } = req.params;
    const { userName, ipAddress, userAgent } = req.body;

    const contract = await Contract.findById(contractId)
      .populate('clientId', 'firstName lastName')
      .populate('freelancerId', 'firstName lastName');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Check if contract is in correct status
    if (contract.status !== 'pending_signatures') {
      return res.status(400).json({
        success: false,
        message: 'Contract is not pending signatures',
      });
    }

    // Determine which party is signing
    const isClient = contract.clientId._id.toString() === userId;
    const isFreelancer = contract.freelancerId._id.toString() === userId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Create signature
    const signature = {
      userId,
      userName,
      signedAt: new Date(),
      ipAddress,
      userAgent,
    };

    // Apply signature
    if (isClient) {
      if (contract.clientSignature) {
        return res.status(400).json({
          success: false,
          message: 'Client has already signed',
        });
      }
      contract.clientSignature = signature;
    } else {
      if (contract.freelancerSignature) {
        return res.status(400).json({
          success: false,
          message: 'Freelancer has already signed',
        });
      }
      contract.freelancerSignature = signature;
    }

    // Check if both parties have signed
    if (contract.clientSignature && contract.freelancerSignature) {
      contract.status = 'active';

      // Notify both parties
      await createNotification({
        userId: contract.clientId._id,
        type: 'system',
        title: '✅ Contract Active',
        message: `Contract "${contract.title}" is now active`,
        relatedId: contract._id,
        relatedType: 'project',
        link: `/client/contracts/${contract._id}`,
        icon: 'mdi:check-circle',
        priority: 'high',
      });

      await createNotification({
        userId: contract.freelancerId._id,
        type: 'system',
        title: '✅ Contract Active',
        message: `Contract "${contract.title}" is now active`,
        relatedId: contract._id,
        relatedType: 'project',
        link: `/freelancer/contracts/${contract._id}`,
        icon: 'mdi:check-circle',
        priority: 'high',
      });
    } else {
      // Notify the other party
      const otherPartyId = isClient ? contract.freelancerId._id : contract.clientId._id;
      await createNotification({
        userId: otherPartyId,
        type: 'system',
        title: '✍️ Contract Signed',
        message: `${userName} signed the contract "${contract.title}"`,
        relatedId: contract._id,
        relatedType: 'project',
        link: isClient ? `/freelancer/contracts/${contract._id}` : `/client/contracts/${contract._id}`,
        icon: 'mdi:pen',
        priority: 'high',
      });
    }

    await contract.save();

    return res.status(200).json({
      success: true,
      message: 'Contract signed successfully',
      data: contract,
    });
  } catch (error: any) {
    console.error('Sign contract error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to sign contract',
    });
  }
};

/**
 * Terminate contract
 */
export const terminateContract = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { contractId } = req.params;
    const { reason } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Verify user is part of the contract
    if (
      contract.clientId.toString() !== userId &&
      contract.freelancerId.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if contract can be terminated
    if (contract.status === 'completed' || contract.status === 'terminated') {
      return res.status(400).json({
        success: false,
        message: 'Contract cannot be terminated',
      });
    }

    contract.status = 'terminated';
    contract.terminatedBy = userId;
    contract.terminationReason = reason;
    contract.terminatedAt = new Date();
    await contract.save();

    // Notify the other party
    const otherPartyId = contract.clientId.toString() === userId
      ? contract.freelancerId
      : contract.clientId;

    await createNotification({
      userId: otherPartyId,
      type: 'system',
      title: '⚠️ Contract Terminated',
      message: `Contract "${contract.title}" has been terminated`,
      relatedId: contract._id,
      relatedType: 'project',
      link: `/contracts/${contract._id}`,
      icon: 'mdi:alert',
      priority: 'high',
    });

    return res.status(200).json({
      success: true,
      message: 'Contract terminated successfully',
      data: contract,
    });
  } catch (error: any) {
    console.error('Terminate contract error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to terminate contract',
    });
  }
};

/**
 * Get contract template
 */
export const getContractTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    const templates: Record<string, any> = {
      fixed_price: {
        terms: [
          {
            title: 'Scope of Work',
            description: 'The Freelancer agrees to complete the work as described in the project description and deliverables section.',
            order: 1,
          },
          {
            title: 'Payment Terms',
            description: 'The Client agrees to pay the fixed price amount upon completion and approval of all deliverables.',
            order: 2,
          },
          {
            title: 'Timeline',
            description: 'The Freelancer agrees to complete the work by the specified end date.',
            order: 3,
          },
          {
            title: 'Revisions',
            description: 'The Client is entitled to reasonable revisions as specified in the project requirements.',
            order: 4,
          },
          {
            title: 'Intellectual Property',
            description: 'Upon full payment, all intellectual property rights will be transferred to the Client.',
            order: 5,
          },
          {
            title: 'Confidentiality',
            description: 'Both parties agree to keep confidential information private and secure.',
            order: 6,
          },
          {
            title: 'Termination',
            description: 'Either party may terminate this contract with written notice and appropriate compensation for work completed.',
            order: 7,
          },
        ],
      },
      hourly: {
        terms: [
          {
            title: 'Hourly Rate',
            description: 'The Client agrees to pay the Freelancer at the agreed hourly rate for all approved hours worked.',
            order: 1,
          },
          {
            title: 'Time Tracking',
            description: 'The Freelancer agrees to accurately track and report all hours worked using the platform time tracking system.',
            order: 2,
          },
          {
            title: 'Payment Schedule',
            description: 'Payments will be processed weekly/bi-weekly for approved hours.',
            order: 3,
          },
          {
            title: 'Work Authorization',
            description: 'The Freelancer may only bill for hours that have been pre-approved or fall within the agreed scope.',
            order: 4,
          },
          {
            title: 'Confidentiality',
            description: 'Both parties agree to keep confidential information private and secure.',
            order: 5,
          },
        ],
      },
      milestone: {
        terms: [
          {
            title: 'Milestone Structure',
            description: 'The project will be completed in milestones as defined in the project plan.',
            order: 1,
          },
          {
            title: 'Milestone Payments',
            description: 'Payment for each milestone will be released upon Client approval of milestone deliverables.',
            order: 2,
          },
          {
            title: 'Timeline',
            description: 'Each milestone has a specified deadline which the Freelancer agrees to meet.',
            order: 3,
          },
          {
            title: 'Approval Process',
            description: 'The Client has 7 days to review and approve each milestone submission.',
            order: 4,
          },
          {
            title: 'Intellectual Property',
            description: 'IP rights transfer upon payment release for each milestone.',
            order: 5,
          },
        ],
      },
    };

    const template = templates[type];
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Get contract template error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch template',
    });
  }
};

/**
 * Get all contracts (Admin only)
 */
export const getAllContracts = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .populate('projectId', 'title description');

    const total = await Contract.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: contracts,
      count: contracts.length,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all contracts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch contracts',
    });
  }
};

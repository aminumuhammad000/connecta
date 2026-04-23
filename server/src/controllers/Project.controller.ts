import { Request, Response } from 'express';
import Project from '../models/Project.model.js';

// Get all projects for a freelancer
export const getFreelancerProjects = async (req: Request, res: Response) => {
  try {
    const { freelancerId } = req.params;
    const { status } = req.query;

    let query: any = { freelancerId };

    if (status && (status === 'ongoing' || status === 'completed' || status === 'cancelled')) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message,
    });
  }
};

// Get logged-in client's own projects
export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { status } = req.query;
    let query: any = { clientId: userId };

    if (status && (status === 'ongoing' || status === 'completed' || status === 'cancelled')) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('clientId', 'firstName lastName email profileImage')
      .populate('freelancerId', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 });

    const projectsWithProgress = projects.map(project => {
      let progress = 0;
      if (project.status === 'ongoing') {
        const start = new Date(project.dateRange.startDate).getTime();
        const end = new Date(project.dateRange.endDate).getTime();
        const now = Date.now();
        const totalDuration = end - start;
        const elapsed = now - start;
        progress = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 95);
      } else if (project.status === 'completed') {
        progress = 100;
      }

      return {
        ...project.toObject(),
        progress
      };
    });

    res.status(200).json({
      success: true,
      count: projectsWithProgress.length,
      data: projectsWithProgress,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message,
    });
  }
};

// Get all projects for a client
export const getClientProjects = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { status } = req.query;

    let query: any = { clientId };

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message,
    });
  }
};

// Get all projects (admin)
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let query: any = {};

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const projects = await Project.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message,
    });
  }
};

// ✅ FIXED: Get single project by ID (Type-safe)
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .populate('uploads.uploadedBy', 'firstName lastName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Fetch payment info
    const Payment = (await import('../models/Payment.model.js')).default;
    const payment = await Payment.findOne({ projectId: id });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        payment: payment ? payment : null
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message,
    });
  }
};

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const projectData = req.body;

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message,
    });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message,
    });
  }
};

// Update project status
export const updateProjectStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, statusLabel } = req.body;

    if (!['ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ongoing, completed, or cancelled',
      });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { status, statusLabel: statusLabel || (status === 'ongoing' ? 'Active' : 'Completed') },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating project status',
      error: error.message,
    });
  }
};

// Add file upload to project
export const addProjectUpload = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fileName, fileUrl, fileType, uploadedBy } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        $push: {
          uploads: {
            fileName,
            fileUrl,
            fileType,
            uploadedBy,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
};

// Add activity to project
export const addProjectActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        $push: {
          activity: {
            date: new Date(),
            description,
          },
        },
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity added successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error adding activity',
      error: error.message,
    });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message,
    });
  }
};

// Get project statistics
export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await Project.aggregate([
      {
        $match: {
          $or: [
            { freelancerId: userId },
            { clientId: userId },
          ],
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project statistics',
      error: error.message,
    });
  }
};

// Submit project as completed (Freelancer)
export const submitProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { summary, files } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        status: 'submitted',
        statusLabel: 'Pending Client Approval',
        submission: {
          summary,
          files: files || [],
          submittedAt: new Date(),
        },
        $push: {
          activity: {
            date: new Date(),
            description: `Project submitted for review. Summary: ${summary.substring(0, 50)}...`,
          }
        },
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project submitted successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error submitting project',
      error: error.message,
    });
  }
};

// Accept project submission (Client) — releases escrow to freelancer's available balance
export const acceptProjectSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = (req as any).user?.id || (req as any).user?._id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only the client who owns this project can approve
    if (project.clientId?.toString() !== clientId?.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can approve project completion.' });
    }

    // Update project status
    project.status = 'completed' as any;
    project.statusLabel = 'Completed';
    (project.activity as any[]).push({ date: new Date(), description: 'Project submission accepted and marked as completed.' });
    await project.save();

    // ── Release escrow → freelancer available balance ─────────────
    try {
      const Payment = (await import('../models/Payment.model.js')).default;
      const Wallet  = (await import('../models/Wallet.model.js')).default;
      const Transaction = (await import('../models/Transaction.model.js')).default;
      const { createNotification } = await import('./notification.controller.js');

      const payment = await Payment.findOne({ projectId: id, escrowStatus: 'held' });

      if (payment) {
        // Mark payment as released
        payment.escrowStatus = 'released';
        payment.releasedAt = new Date();
        await payment.save();

        // ── Update freelancer wallet ──────────────────────────────
        let freelancerWallet = await Wallet.findOne({ userId: payment.payeeId });
        if (!freelancerWallet) {
          freelancerWallet = new Wallet({ userId: payment.payeeId });
        }

        const balanceBefore = freelancerWallet.balance;

        // escrowBalance goes DOWN → availableBalance goes UP automatically
        // (pre-save hook: availableBalance = balance - escrowBalance)
        // balance stays the same — the money was already added to balance on proposal approval
        freelancerWallet.escrowBalance = Math.max(0, (freelancerWallet.escrowBalance || 0) - payment.netAmount);
        freelancerWallet.totalEarnings = (freelancerWallet.totalEarnings || 0) + payment.netAmount;
        await freelancerWallet.save(); // hook recalculates availableBalance

        // ── Update the pending escrow Transaction to completed ────
        await Transaction.findOneAndUpdate(
          {
            userId: payment.payeeId,
            paymentId: payment._id,
            status: 'pending',
            type: 'payment_received',
          },
          {
            status: 'completed',
            description: `💸 Escrow released for project: ${project.title}. Funds are now available to withdraw.`,
            balanceAfter: freelancerWallet.balance, // update the balanceAfter as well
          }
        );

        // ── Notify freelancer ─────────────────────────────────────
        await createNotification({
          userId: payment.payeeId,
          type: 'payment_received',
          title: '🎉 Payment Released!',
          message: `₦${payment.netAmount.toLocaleString()} from project "${project.title}" is now available in your wallet. You can withdraw it to your bank account.`,
          relatedId: payment._id,
          relatedType: 'payment',
          priority: 'high',
        });

        console.log(`✅ Escrow released: ₦${payment.netAmount} for project ${id} → freelancer ${payment.payeeId}`);
      } else {
        console.warn(`⚠️  No held payment found for project ${id}. Wallet not updated.`);
      }
    } catch (paymentError) {
      console.error('Error auto-releasing payment:', paymentError);
      // Don't fail the whole request — project status WAS updated
    }

    res.status(200).json({
      success: true,
      message: 'Project accepted. Payment released to freelancer\'s available balance.',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error accepting project', error: error.message });
  }
};

// Request revision (Client)
export const requestRevision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        status: 'revision_requested',
        statusLabel: 'Revision Requested',
        $push: {
          activity: {
            date: new Date(),
            description: `Revision requested: ${feedback || 'No feedback provided'}`,
          }
        },
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Revision requested successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error requesting revision',
      error: error.message,
    });
  }
};

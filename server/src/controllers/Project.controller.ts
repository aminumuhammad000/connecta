import { Request, Response } from 'express';
import Project from '../models/Project.model';

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

    res.status(200).json({
      success: true,
      data: project,
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

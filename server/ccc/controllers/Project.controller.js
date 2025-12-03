"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStats = exports.deleteProject = exports.addProjectActivity = exports.addProjectUpload = exports.updateProjectStatus = exports.updateProject = exports.createProject = exports.getProjectById = exports.getAllProjects = exports.getClientProjects = exports.getMyProjects = exports.getFreelancerProjects = void 0;
const Project_model_1 = __importDefault(require("../models/Project.model"));
// Get all projects for a freelancer
const getFreelancerProjects = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const { status } = req.query;
        let query = { freelancerId };
        if (status && (status === 'ongoing' || status === 'completed' || status === 'cancelled')) {
            query.status = status;
        }
        const projects = await Project_model_1.default.find(query)
            .populate('clientId', 'firstName lastName email')
            .populate('freelancerId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message,
        });
    }
};
exports.getFreelancerProjects = getFreelancerProjects;
// Get logged-in client's own projects
const getMyProjects = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        const { status } = req.query;
        let query = { clientId: userId };
        if (status && (status === 'ongoing' || status === 'completed' || status === 'cancelled')) {
            query.status = status;
        }
        const projects = await Project_model_1.default.find(query)
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
            }
            else if (project.status === 'completed') {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message,
        });
    }
};
exports.getMyProjects = getMyProjects;
// Get all projects for a client
const getClientProjects = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { status } = req.query;
        let query = { clientId };
        if (status) {
            query.status = status;
        }
        const projects = await Project_model_1.default.find(query)
            .populate('clientId', 'firstName lastName email')
            .populate('freelancerId', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message,
        });
    }
};
exports.getClientProjects = getClientProjects;
// Get all projects (admin)
const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const projects = await Project_model_1.default.find(query)
            .populate('clientId', 'firstName lastName email')
            .populate('freelancerId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip);
        const total = await Project_model_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            count: projects.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: projects,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message,
        });
    }
};
exports.getAllProjects = getAllProjects;
// ✅ FIXED: Get single project by ID (Type-safe)
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project_model_1.default.findById(id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project',
            error: error.message,
        });
    }
};
exports.getProjectById = getProjectById;
// Create a new project
const createProject = async (req, res) => {
    try {
        const projectData = req.body;
        const project = await Project_model_1.default.create(projectData);
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating project',
            error: error.message,
        });
    }
};
exports.createProject = createProject;
// Update project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const project = await Project_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating project',
            error: error.message,
        });
    }
};
exports.updateProject = updateProject;
// Update project status
const updateProjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, statusLabel } = req.body;
        if (!['ongoing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be ongoing, completed, or cancelled',
            });
        }
        const project = await Project_model_1.default.findByIdAndUpdate(id, { status, statusLabel: statusLabel || (status === 'ongoing' ? 'Active' : 'Completed') }, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating project status',
            error: error.message,
        });
    }
};
exports.updateProjectStatus = updateProjectStatus;
// Add file upload to project
const addProjectUpload = async (req, res) => {
    try {
        const { id } = req.params;
        const { fileName, fileUrl, fileType, uploadedBy } = req.body;
        const project = await Project_model_1.default.findByIdAndUpdate(id, {
            $push: {
                uploads: {
                    fileName,
                    fileUrl,
                    fileType,
                    uploadedBy,
                    uploadedAt: new Date(),
                },
            },
        }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message,
        });
    }
};
exports.addProjectUpload = addProjectUpload;
// Add activity to project
const addProjectActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const project = await Project_model_1.default.findByIdAndUpdate(id, {
            $push: {
                activity: {
                    date: new Date(),
                    description,
                },
            },
        }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding activity',
            error: error.message,
        });
    }
};
exports.addProjectActivity = addProjectActivity;
// Delete project
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project_model_1.default.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting project',
            error: error.message,
        });
    }
};
exports.deleteProject = deleteProject;
// Get project statistics
const getProjectStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await Project_model_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project statistics',
            error: error.message,
        });
    }
};
exports.getProjectStats = getProjectStats;

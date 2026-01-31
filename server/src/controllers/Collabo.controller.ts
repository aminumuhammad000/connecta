import { Request, Response } from 'express';
import CollaboService from '../services/Collabo.service.js';
import Payment from '../models/Payment.model.js';
import flutterwaveService from '../services/flutterwave.service.js';
import User from '../models/user.model.js';
import CollaboProject from '../models/CollaboProject.model.js';

export const createCollaboProject = async (req: Request, res: Response) => {
    try {
        if (!(req as any).user || !(req as any).user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const clientId = (req as any).user._id;
        console.log(`[Collabo] Creating project for client: ${clientId}`);
        const { title, teamName, description, totalBudget, roles, milestones, recommendedStack, risks, category, niche, projectType, scope, duration, durationType } = req.body;
        console.log("[Collabo] Request Body:", JSON.stringify({ title, teamName, totalBudget, rolesCount: roles?.length }, null, 2));

        if (!Array.isArray(roles)) {
            return res.status(400).json({ message: "Roles must be an array" });
        }

        const result = await CollaboService.createCollaboProject(clientId, {
            title,
            teamName,
            description,
            totalBudget,
            roles,
            milestones,
            recommendedStack,
            risks,
            category,
            niche,
            projectType,
            scope,
            duration,
            durationType
        });

        res.status(201).json(result);
    } catch (error: any) {
        console.error('Create Collabo Project Error:', error);
        res.status(500).json({ message: 'Failed to create project', error: error.message });
    }
};

export const getCollaboProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await CollaboService.getProjectDetails(id);
        if (!result.project) return res.status(404).json({ message: "Project not found" });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch project', error: error.message });
    }
}

export const scopeProject = async (req: Request, res: Response) => {
    try {
        const { description, useAI = true } = req.body;
        if (!description) return res.status(400).json({ message: "Description is required" });

        const result = await CollaboService.scopeProject(description, useAI);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to scope project', error: error.message });
    }
}

export const fundProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id;

        const project = await CollaboProject.findById(id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.clientId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const amount = project.totalBudget;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid project budget" });
        }

        // Create Payment
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const payment = new Payment({
            collaboProjectId: project._id,
            payerId: userId,
            payeeId: userId, // Holding in platform escrow effectively
            amount,
            currency: 'NGN',
            platformFee: 0,
            netAmount: amount,
            paymentType: 'full_payment',
            description: `Funding for Collabo Project: ${project.title}`,
            status: 'pending',
            escrowStatus: 'held'
        });

        await payment.save();

        // Init Flutterwave
        const flutterwaveResponse = await flutterwaveService.initializePayment(
            user.email,
            amount,
            payment._id.toString(),
            { collaboProjectId: project._id, type: 'collabo_funding' }
        );

        payment.gatewayReference = payment._id.toString();
        await payment.save();

        res.json({
            paymentId: payment._id,
            authorizationUrl: flutterwaveResponse.data.link,
            reference: payment._id.toString()
        });

    } catch (error: any) {
        res.status(500).json({ message: 'Failed to initiate funding', error: error.message });
    }
}

export const activateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // In real app, verify payment reference here using PaymentService

        const result = await CollaboService.activateProject(id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to activate project', error: error.message });
    }
}

export const getMyProjects = async (req: Request, res: Response) => {
    try {
        const clientId = (req as any).user._id;
        const result = await CollaboService.getClientProjectsWithRoles(clientId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
}

export const getFreelancerProjects = async (req: Request, res: Response) => {
    try {
        const freelancerId = (req as any).user._id;
        const result = await CollaboService.getFreelancerProjects(freelancerId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
}

export const acceptRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.body;
        const freelancerId = (req as any).user._id;
        const result = await CollaboService.acceptRole(roleId, freelancerId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to accept role', error: error.message });
    }
}

export const getRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await CollaboService.getRole(id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to get role', error: error.message });
    }
}

export const removeFromRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;
        const clientId = (req as any).user._id;
        const result = await CollaboService.removeFromRole(roleId, clientId);
        res.json({ message: 'Freelancer removed successfully', role: result });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to remove freelancer', error: error.message });
    }
}

export const inviteToRole = async (req: Request, res: Response) => {
    try {
        const { roleId } = req.params;
        const { freelancerId } = req.body;
        const clientId = (req as any).user._id;
        const result = await CollaboService.inviteToRole(roleId, freelancerId, clientId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: `Failed to send invitation: ${error.message}`, error: error.message });
    }
}

export const addRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // projectId
        const { title, description, budget, skills } = req.body;
        const clientId = (req as any).user._id;
        const result = await CollaboService.addRole(id, clientId, { title, description, budget, skills });
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to add role', error: error.message });
    }
}

export const startWork = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const clientId = (req as any).user._id;
        const result = await CollaboService.startWork(id, clientId);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to start work' });
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { workspaceId, channelName, content, senderRole } = req.body;
        const senderId = (req as any).user._id;
        const result = await CollaboService.sendMessage(workspaceId, channelName, senderId, senderRole, content);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
}

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { workspaceId, channelName } = req.query;
        const result = await CollaboService.getMessages(workspaceId as string, channelName as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
}

// Task Management
export const createTask = async (req: Request, res: Response) => {
    try {
        const { workspaceId, title, description, priority, assigneeId, dueDate } = req.body;
        const createdBy = (req as any).user._id;

        const task = await CollaboService.createTask({
            workspaceId,
            title,
            description,
            priority,
            assigneeId,
            createdBy,
            dueDate
        });
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
}

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.query;
        const tasks = await CollaboService.getTasks(workspaceId as string);
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const task = await CollaboService.updateTask(id, updates);
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
}

// File Management
export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const { workspaceId } = req.body;
        const uploaderId = (req as any).user._id;

        const file = await CollaboService.addFile({
            workspaceId,
            uploaderId,
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size,
            url: (req.file as any).path || (req.file as any).secure_url
        });
        res.json(file);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to upload file', error: error.message });
    }
}

export const getFiles = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.query;
        const files = await CollaboService.getFiles(workspaceId as string);
        res.json(files);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch files', error: error.message });
    }
}
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CollaboService.deleteTask(id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
}

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CollaboService.deleteFile(id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
}

export const markRead = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.body;
        const userId = (req as any).user._id;
        await CollaboService.markWorkspaceRead(workspaceId, userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to mark read', error: error.message });
    }
}

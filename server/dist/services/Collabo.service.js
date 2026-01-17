"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CollaboProject_model_1 = __importDefault(require("../models/CollaboProject.model"));
const ProjectRole_model_1 = __importDefault(require("../models/ProjectRole.model"));
const CollaboWorkspace_model_1 = __importDefault(require("../models/CollaboWorkspace.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const LLM_service_1 = __importDefault(require("./LLM.service"));
const CollaboMessage_model_1 = __importDefault(require("../models/CollaboMessage.model"));
const socketIO_1 = require("../core/utils/socketIO");
const CollaboFile_model_1 = __importDefault(require("../models/CollaboFile.model"));
const CollaboTask_model_1 = __importDefault(require("../models/CollaboTask.model"));
class CollaboService {
    /**
     * Creates a new Collabo Project and its associated roles
     */
    async createCollaboProject(clientId, data) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // 1. Create Project
            const project = new CollaboProject_model_1.default({
                clientId,
                title: data.title,
                description: data.description,
                totalBudget: data.totalBudget,
                status: 'planning',
                milestones: data.milestones,
                recommendedStack: data.recommendedStack,
                risks: data.risks,
                category: data.category,
                niche: data.niche,
                projectType: data.projectType,
                scope: data.scope,
                duration: data.duration,
                durationType: data.durationType
            });
            await project.save({ session });
            // 2. Create Roles
            const roleDocs = data.roles.map(role => ({
                projectId: project._id,
                title: role.title,
                description: role.description,
                budget: role.budget,
                skills: role.skills,
                status: 'open',
            }));
            const createdRoles = await ProjectRole_model_1.default.insertMany(roleDocs, { session });
            // 3. Create Workspace (Empty for now)
            const workspace = new CollaboWorkspace_model_1.default({
                projectId: project._id,
                channels: [{ name: 'General', roleIds: [] }],
            });
            await workspace.save({ session });
            project.workspaceId = workspace._id;
            await project.save({ session });
            await session.commitTransaction();
            return { project, roles: createdRoles, workspace };
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async getProjectDetails(projectId) {
        const project = await CollaboProject_model_1.default.findById(projectId).populate('clientId', 'firstName lastName avatar');
        const roles = await ProjectRole_model_1.default.find({ projectId }).populate('freelancerId', 'firstName lastName avatar');
        const workspace = await CollaboWorkspace_model_1.default.findOne({ projectId });
        return { project, roles, workspace };
    }
    async scopeProject(description) {
        // Use Real AI to scope the project
        const scope = await LLM_service_1.default.scopeProject(description);
        // Ensure roles have required fields for frontend mapping
        const processedRoles = scope.roles.map((r) => ({
            ...r,
            _id: new mongoose_1.default.Types.ObjectId().toString(), // Temp ID for UI keys
        }));
        return {
            ...scope,
            roles: processedRoles
        };
    }
    async activateProject(projectId) {
        // 1. Update status
        const project = await CollaboProject_model_1.default.findByIdAndUpdate(projectId, { status: 'active' }, { new: true });
        if (!project)
            throw new Error("Project not found");
        // 2. Trigger Invitations
        this.autoInviteFreelancers(projectId); // Async fire-and-forget
        return project;
    }
    async autoInviteFreelancers(projectId) {
        try {
            const roles = await ProjectRole_model_1.default.find({ projectId, status: 'open' });
            for (const role of roles) {
                if (!role.skills || role.skills.length === 0)
                    continue;
                // Find profiles with matching skills
                const matchingProfiles = await Profile_model_1.default.find({
                    skills: { $in: role.skills }
                }).limit(5);
                for (const profile of matchingProfiles) {
                    await Notification_model_1.default.create({
                        userId: profile.user,
                        type: 'collabo_invite',
                        title: `Team Invite: ${role.title}`,
                        message: `You've been matched for a team project role: ${role.title} ($${role.budget}).`,
                        relatedId: role._id,
                        relatedType: 'project',
                        link: `/collabo/invite/${role._id}`,
                        isRead: false
                    });
                }
            }
        }
        catch (error) {
            console.error("Auto-invite error:", error);
        }
    }
    async getClientProjects(clientId) {
        return CollaboProject_model_1.default.find({ clientId }).populate('clientId', 'firstName lastName avatar').sort({ createdAt: -1 });
    }
    async acceptRole(roleId, freelancerId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const role = await ProjectRole_model_1.default.findOneAndUpdate({ _id: roleId, status: 'open' }, { freelancerId, status: 'filled' }, { new: true, session });
            if (!role)
                throw new Error("Role not found or already filled");
            // Add to workspace channel (General)
            await CollaboWorkspace_model_1.default.findOneAndUpdate({ projectId: role.projectId }, { $addToSet: { "channels.$[elem].roleIds": role._id } }, { arrayFilters: [{ "elem.name": "General" }], session });
            await session.commitTransaction();
            return role;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async getRole(roleId) {
        // Return role with project details
        const role = await ProjectRole_model_1.default.findById(roleId);
        if (!role)
            throw new Error("Role not found");
        const project = await CollaboProject_model_1.default.findById(role.projectId).populate('clientId', 'firstName lastName avatar');
        return { role, project };
    }
    async sendMessage(workspaceId, channelName, senderId, senderRole, content) {
        const message = await CollaboMessage_model_1.default.create({
            workspaceId,
            channelName,
            senderId,
            senderRole,
            content
        });
        await message.populate('senderId', 'firstName lastName avatar');
        try {
            (0, socketIO_1.getIO)().to(workspaceId).emit('collabo:message', message);
        }
        catch (e) {
            console.error("Socket emit failed", e);
        }
        return message;
    }
    async getMessages(workspaceId, channelName) {
        return CollaboMessage_model_1.default.find({ workspaceId, channelName })
            .populate('senderId', 'firstName lastName avatar')
            .sort({ createdAt: 1 });
    }
    // Task Management
    async createTask(data) {
        const task = await CollaboTask_model_1.default.create(data);
        return task.populate('assigneeId', 'firstName lastName avatar');
    }
    async getTasks(workspaceId) {
        return CollaboTask_model_1.default.find({ workspaceId })
            .populate('assigneeId', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
    }
    async updateTask(taskId, updates) {
        const task = await CollaboTask_model_1.default.findByIdAndUpdate(taskId, updates, { new: true })
            .populate('assigneeId', 'firstName lastName avatar');
        try {
            (0, socketIO_1.getIO)().to(task?.workspaceId.toString() || '').emit('collabo:task_update', task);
        }
        catch (e) {
            console.log("Socket emit error", e);
        }
        return task;
    }
    // File Management
    async addFile(data) {
        const file = await CollaboFile_model_1.default.create(data);
        const populatedFile = await file.populate('uploaderId', 'firstName lastName avatar');
        try {
            (0, socketIO_1.getIO)().to(data.workspaceId).emit('collabo:file_upload', populatedFile);
        }
        catch (e) {
            console.error("Socket emit failed for file upload", e);
        }
        return populatedFile;
    }
    async getFiles(workspaceId) {
        return CollaboFile_model_1.default.find({ workspaceId })
            .populate('uploaderId', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
    }
}
exports.default = new CollaboService();

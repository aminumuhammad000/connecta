import CollaboProject from '../models/CollaboProject.model';
import ProjectRole from '../models/ProjectRole.model';
import CollaboWorkspace from '../models/CollaboWorkspace.model';
import mongoose from 'mongoose';
import Notification from '../models/Notification.model';
import Profile from '../models/Profile.model';
import LLMService from './LLM.service';
import CollaboMessage from '../models/CollaboMessage.model';
import { getIO } from '../core/utils/socketIO';
import CollaboFile from '../models/CollaboFile.model';
import CollaboTask from '../models/CollaboTask.model';
class CollaboService {
    /**
     * Creates a new Collabo Project and its associated roles
     */
    async createCollaboProject(clientId, data) {
        let session = null;
        let useTransaction = false;
        try {
            // Try to start a session (only works with replica sets)
            try {
                session = await mongoose.startSession();
                session.startTransaction();
                useTransaction = true;
            }
            catch (err) {
                console.warn('⚠️ Transactions not supported, using non-transactional saves');
                session = null;
            }
            // 1. Create Project
            const project = new CollaboProject({
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
            await project.save(session ? { session } : {});
            // 2. Create Roles
            const roleDocs = data.roles.map(role => ({
                projectId: project._id,
                title: role.title,
                description: role.description,
                budget: role.budget,
                skills: role.skills,
                status: 'open',
            }));
            const createdRoles = await ProjectRole.insertMany(roleDocs, session ? { session } : {});
            // 3. Create Workspace (Empty for now)
            const workspace = new CollaboWorkspace({
                projectId: project._id,
                channels: [{ name: 'General', roleIds: [] }],
            });
            await workspace.save(session ? { session } : {});
            project.workspaceId = workspace._id;
            await project.save(session ? { session } : {});
            if (useTransaction && session) {
                await session.commitTransaction();
            }
            return { project, roles: createdRoles, workspace };
        }
        catch (error) {
            if (useTransaction && session) {
                await session.abortTransaction();
            }
            throw error;
        }
        finally {
            if (session) {
                session.endSession();
            }
        }
    }
    async getProjectDetails(projectId) {
        const project = await CollaboProject.findById(projectId).populate('clientId', 'firstName lastName avatar');
        const roles = await ProjectRole.find({ projectId }).populate('freelancerId', 'firstName lastName avatar');
        const workspace = await CollaboWorkspace.findOne({ projectId });
        return { project, roles, workspace };
    }
    async scopeProject(description) {
        // Use Real AI to scope the project
        const scope = await LLMService.scopeProject(description);
        // Ensure roles have required fields for frontend mapping
        const processedRoles = scope.roles.map((r) => ({
            ...r,
            _id: new mongoose.Types.ObjectId().toString(), // Temp ID for UI keys
        }));
        return {
            ...scope,
            roles: processedRoles
        };
    }
    async activateProject(projectId) {
        // 1. Update status
        const project = await CollaboProject.findByIdAndUpdate(projectId, { status: 'active' }, { new: true });
        if (!project)
            throw new Error("Project not found");
        // 2. Trigger Invitations
        this.autoInviteFreelancers(projectId); // Async fire-and-forget
        return project;
    }
    async autoInviteFreelancers(projectId) {
        try {
            const roles = await ProjectRole.find({ projectId, status: 'open' });
            for (const role of roles) {
                if (!role.skills || role.skills.length === 0)
                    continue;
                // Find profiles with matching skills
                const matchingProfiles = await Profile.find({
                    skills: { $in: role.skills }
                }).limit(5);
                for (const profile of matchingProfiles) {
                    await Notification.create({
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
        return CollaboProject.find({ clientId }).populate('clientId', 'firstName lastName avatar').sort({ createdAt: -1 });
    }
    async acceptRole(roleId, freelancerId) {
        let session = null;
        let useTransaction = false;
        try {
            // Try to start a session (only works with replica sets)
            try {
                session = await mongoose.startSession();
                session.startTransaction();
                useTransaction = true;
            }
            catch (err) {
                console.warn('⚠️ Transactions not supported, using non-transactional updates');
                session = null;
            }
            const role = await ProjectRole.findOneAndUpdate({ _id: roleId, status: 'open' }, { freelancerId, status: 'filled' }, { new: true, ...(session ? { session } : {}) });
            if (!role)
                throw new Error("Role not found or already filled");
            // Add to workspace channel (General)
            await CollaboWorkspace.findOneAndUpdate({ projectId: role.projectId }, { $addToSet: { "channels.$[elem].roleIds": role._id } }, { arrayFilters: [{ "elem.name": "General" }], ...(session ? { session } : {}) });
            if (useTransaction && session) {
                await session.commitTransaction();
            }
            return role;
        }
        catch (error) {
            if (useTransaction && session) {
                await session.abortTransaction();
            }
            throw error;
        }
        finally {
            if (session) {
                session.endSession();
            }
        }
    }
    async getRole(roleId) {
        // Return role with project details
        const role = await ProjectRole.findById(roleId);
        if (!role)
            throw new Error("Role not found");
        const project = await CollaboProject.findById(role.projectId).populate('clientId', 'firstName lastName avatar');
        return { role, project };
    }
    async sendMessage(workspaceId, channelName, senderId, senderRole, content) {
        const message = await CollaboMessage.create({
            workspaceId,
            channelName,
            senderId,
            senderRole,
            content
        });
        await message.populate('senderId', 'firstName lastName avatar');
        try {
            getIO().to(workspaceId).emit('collabo:message', message);
        }
        catch (e) {
            console.error("Socket emit failed", e);
        }
        return message;
    }
    async getMessages(workspaceId, channelName) {
        return CollaboMessage.find({ workspaceId, channelName })
            .populate('senderId', 'firstName lastName avatar')
            .sort({ createdAt: 1 });
    }
    // Task Management
    async createTask(data) {
        const task = await CollaboTask.create(data);
        return task.populate('assigneeId', 'firstName lastName avatar');
    }
    async getTasks(workspaceId) {
        return CollaboTask.find({ workspaceId })
            .populate('assigneeId', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
    }
    async updateTask(taskId, updates) {
        const task = await CollaboTask.findByIdAndUpdate(taskId, updates, { new: true })
            .populate('assigneeId', 'firstName lastName avatar');
        try {
            getIO().to(task?.workspaceId.toString() || '').emit('collabo:task_update', task);
        }
        catch (e) {
            console.log("Socket emit error", e);
        }
        return task;
    }
    // File Management
    async addFile(data) {
        const file = await CollaboFile.create(data);
        const populatedFile = await file.populate('uploaderId', 'firstName lastName avatar');
        try {
            getIO().to(data.workspaceId).emit('collabo:file_upload', populatedFile);
        }
        catch (e) {
            console.error("Socket emit failed for file upload", e);
        }
        return populatedFile;
    }
    async getFiles(workspaceId) {
        return CollaboFile.find({ workspaceId })
            .populate('uploaderId', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
    }
}
export default new CollaboService();

import CollaboProject, { ICollaboProject } from '../models/CollaboProject.model';
import ProjectRole, { IProjectRole } from '../models/ProjectRole.model';
import CollaboWorkspace from '../models/CollaboWorkspace.model';
import mongoose from 'mongoose';
import Notification from '../models/Notification.model';
import Profile from '../models/Profile.model';
import LLMService from './LLM.service';
import CollaboMessage from '../models/CollaboMessage.model';
import { getIO } from '../core/utils/socketIO';
import CollaboFile from '../models/CollaboFile.model';
import CollaboTask from '../models/CollaboTask.model';
import User from '../models/user.model';
import { sendEmail } from './email.service';
import { getBaseTemplate } from '../utils/emailTemplates';

class CollaboService {
    /**
     * Creates a new Collabo Project and its associated roles
     */
    async createCollaboProject(
        clientId: string,
        data: {
            title: string;
            teamName?: string;
            description: string;
            totalBudget: number;
            roles: { title: string; description: string; budget: number; skills: string[] }[];
            milestones?: any[];
            recommendedStack?: string[];
            risks?: string[];
            category?: string;
            niche?: string;
            projectType?: string;
            scope?: string;
            duration?: string;
            durationType?: string;
        }
    ) {
        // Transactions removed for standalone MongoDB compatibility
        try {
            console.log("Starting createCollaboProject for client:", clientId);

            // 1. Create Project
            const project = new CollaboProject({
                clientId,
                title: data.title,
                teamName: data.teamName,
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
            console.log("Saving project...");
            await project.save();
            console.log("Project saved:", project._id);

            // 2. Create Roles
            const roleDocs = data.roles.map(role => ({
                projectId: project._id,
                title: role.title,
                description: role.description,
                budget: role.budget,
                skills: role.skills,
                status: 'open',
            }));

            console.log("Creating roles...", roleDocs.length);
            const createdRoles = await ProjectRole.insertMany(roleDocs);
            console.log("Roles created.");

            // 3. Create Workspace
            const workspace = new CollaboWorkspace({
                projectId: project._id,
                channels: [{ name: 'General', roleIds: [] }],
            });
            console.log("Saving workspace...");
            await workspace.save();
            console.log("Workspace saved:", workspace._id);

            project.workspaceId = workspace._id as mongoose.Types.ObjectId;
            await project.save();
            console.log("Project updated with workspace ID.");

            return { project, roles: createdRoles, workspace };
        } catch (error) {
            console.error("Create Collabo Project Error Details:", error);
            throw error;
        }
    }

    async getProjectDetails(projectId: string) {
        const project = await CollaboProject.findById(projectId).populate('clientId', 'firstName lastName avatar');
        const roles = await ProjectRole.find({ projectId }).populate('freelancerId', 'firstName lastName avatar');
        const workspace = await CollaboWorkspace.findOne({ projectId });

        return { project, roles, workspace };
    }

    async scopeProject(description: string) {
        // Use Real AI to scope the project
        const scope = await LLMService.scopeProject(description);

        // Ensure roles have required fields for frontend mapping
        const processedRoles = scope.roles.map((r: any) => ({
            ...r,
            _id: new mongoose.Types.ObjectId().toString(), // Temp ID for UI keys
        }));

        return {
            ...scope,
            roles: processedRoles
        };
    }

    async activateProject(projectId: string) {
        // 1. Update status
        const project = await CollaboProject.findByIdAndUpdate(projectId, { status: 'active' }, { new: true });
        if (!project) throw new Error("Project not found");

        // 2. Trigger Invitations
        this.autoInviteFreelancers(projectId); // Async fire-and-forget

        return project;
    }

    async startWork(projectId: string, clientId: string) {
        // 1. Get roles and populate freelancer info
        const roles = await ProjectRole.find({ projectId }).populate('freelancerId', 'firstName lastName email');

        // 2. Update project status to in_progress
        const project = await CollaboProject.findByIdAndUpdate(
            projectId,
            { status: 'in_progress' },
            { new: true }
        ).populate('clientId', 'firstName lastName email');

        if (!project) throw new Error("Project not found");
        const client = project.clientId as any;

        // 3. Notify all team members who have accepted
        for (const role of roles) {
            if (role.freelancerId) {
                const freelancer = role.freelancerId as any;

                // App Notification
                await Notification.create({
                    userId: freelancer._id,
                    type: 'collabo_started',
                    title: 'Work Started!',
                    message: `${client.firstName} has started work on "${project.title}"`,
                    relatedId: projectId,
                    relatedType: 'project',
                    link: `/collabo/${projectId}`,
                    isRead: false
                });

                // Email Notification
                try {
                    const emailHtml = getBaseTemplate({
                        title: 'Work Started! 🚀',
                        subject: `Work has started on ${project.title}`,
                        content: `
                            <p>Hi ${freelancer.firstName},</p>
                            <p><strong>${client.firstName} ${client.lastName}</strong> has officially started the project <strong>${project.title}</strong>.</p>
                            <p>You can now collaborate with the team and track progress in the workspace.</p>
                        `,
                        actionUrl: `${process.env.CLIENT_URL || 'https://app.myconnecta.ng'}/collabo/${projectId}`,
                        actionText: 'Go to Workspace'
                    });

                    await sendEmail(
                        freelancer.email,
                        `Work Started: ${project.title}`,
                        emailHtml
                    );
                } catch (emailError) {
                    console.error('Failed to send start work email:', emailError);
                }
            }
        }

        return project;
    }

    async autoInviteFreelancers(projectId: string) {
        // Disabled automatic invitations per user request.
        // Clients will manually invite freelancers they prefer.
        console.log(`Auto-invite skipped for project ${projectId}. Client will invite manually.`);
        return;

        /* 
        // Original Logic (Disabled)
        try {
            const roles = await ProjectRole.find({ projectId, status: 'open' });

            for (const role of roles) {
                if (!role.skills || role.skills.length === 0) continue;

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
        } catch (error) {
            console.error("Auto-invite error:", error);
        }
        */
    }

    async getClientProjects(clientId: string) {
        return CollaboProject.find({ clientId }).populate('clientId', 'firstName lastName avatar').sort({ createdAt: -1 });
    }

    async getClientProjectsWithRoles(clientId: string) {
        const projects = await CollaboProject.find({ clientId })
            .populate('clientId', 'firstName lastName avatar')
            .populate('workspaceId')
            .sort({ createdAt: -1 });
        const projectsWithRoles = await Promise.all(projects.map(async (project) => {
            const roles = await ProjectRole.find({ projectId: project._id });
            return { ...project.toObject(), roles };
        }));
        return projectsWithRoles;
    }

    async getFreelancerProjects(freelancerId: string) {
        // Find all roles where this freelancer is assigned
        const roles = await ProjectRole.find({ freelancerId, status: 'filled' });
        const projectIds = roles.map(r => r.projectId);

        // Get the projects
        const projects = await CollaboProject.find({ _id: { $in: projectIds } })
            .populate('clientId', 'firstName lastName avatar')
            .populate('workspaceId')
            .sort({ createdAt: -1 });

        return projects;
    }

    async acceptRole(roleId: string, freelancerId: string) {
        // Transactions removed for standalone MongoDB compatibility
        try {
            const role = await ProjectRole.findOneAndUpdate(
                { _id: roleId, status: 'open' },
                { freelancerId, status: 'filled' },
                { new: true }
            ).populate('freelancerId', 'firstName lastName email');

            if (!role) throw new Error("Role not found or already filled");

            // Get project and client info
            const project = await CollaboProject.findById(role.projectId).populate('clientId', 'firstName lastName email');
            if (!project) throw new Error("Project not found");

            // Add to workspace channel (General)
            await CollaboWorkspace.findOneAndUpdate(
                { projectId: role.projectId },
                { $addToSet: { "channels.$[elem].roleIds": role._id } },
                { arrayFilters: [{ "elem.name": "General" }] }
            );

            // Notify client about acceptance
            const freelancer = role.freelancerId as any;
            const client = project.clientId as any;

            await Notification.create({
                userId: client._id,
                type: 'proposal_accepted',
                title: 'Team Member Joined!',
                message: `${freelancer.firstName} ${freelancer.lastName} has accepted the ${role.title} position for "${project.title}"`,
                relatedId: project._id,
                relatedType: 'project',
                link: `/collabo/${project._id}`,
                isRead: false
            });

            // Email Notification for Acceptance
            try {
                const emailHtml = getBaseTemplate({
                    title: 'New Team Member! 🎉',
                    subject: `Role Accepted: ${role.title}`,
                    content: `
                        <p>Hi ${client.firstName},</p>
                        <p>Great news! <strong>${freelancer.firstName} ${freelancer.lastName}</strong> has accepted the <strong>${role.title}</strong> role for <strong>${project.title}</strong>.</p>
                        <p>They have been added to the project workspace.</p>
                    `,
                    actionUrl: `${process.env.CLIENT_URL || 'https://app.myconnecta.ng'}/collabo/${project._id}`,
                    actionText: 'Go to Workspace'
                });

                await sendEmail(
                    client.email,
                    `New Team Member: ${project.title}`,
                    emailHtml
                );
            } catch (emailError) {
                console.error('Failed to send acceptance email:', emailError);
            }

            return role;
        } catch (error) {
            console.error("Accept Role Error:", error);
            throw error;
        }
    }

    async removeFromRole(roleId: string, clientId: string) {
        try {
            const role = await ProjectRole.findById(roleId).populate('freelancerId', 'firstName lastName email');
            if (!role) throw new Error("Role not found");

            const project = await CollaboProject.findById(role.projectId).populate('clientId', 'firstName lastName email');
            if (!project) throw new Error("Project not found");

            // Verify client owns this project
            if (project.clientId._id.toString() !== clientId) {
                throw new Error("Unauthorized: Only project owner can remove team members");
            }

            const removedFreelancer = role.freelancerId as any;

            // Remove from role
            role.freelancerId = undefined;
            role.status = 'open';
            await role.save();

            // Remove from workspace channels
            await CollaboWorkspace.findOneAndUpdate(
                { projectId: role.projectId },
                { $pull: { "channels.$[].roleIds": role._id } }
            );

            // Notify removed freelancer
            if (removedFreelancer) {
                await Notification.create({
                    userId: removedFreelancer._id,
                    type: 'system',
                    title: 'Removed from Team',
                    message: `You've been removed from "${project.title}"`,
                    relatedId: project._id,
                    relatedType: 'project',
                    isRead: false
                });

                // Send email
                try {
                    const emailHtml = getBaseTemplate({
                        title: 'Team Update',
                        subject: 'Removed from project team',
                        content: `
                            <p>Hi ${removedFreelancer.firstName},</p>
                            <p>You have been removed from the team for <strong>${project.title}</strong>.</p>
                            <p>Thank you for your time on this project.</p>
                        `
                    });

                    await sendEmail(
                        removedFreelancer.email,
                        `Removed from ${project.title}`,
                        emailHtml
                    );
                } catch (emailError) {
                    console.error('Failed to send removal email:', emailError);
                }
            }

            return role;
        } catch (error) {
            console.error("Remove From Role Error:", error);
            throw error;
        }
    }

    async inviteToRole(roleId: string, freelancerId: string, clientId: string) {
        try {
            const role = await ProjectRole.findById(roleId);
            if (!role) throw new Error("Role not found");

            const project = await CollaboProject.findById(role.projectId).populate('clientId', 'firstName lastName email');
            if (!project) throw new Error("Project not found");

            // Verify client owns this project
            if (project.clientId._id.toString() !== clientId) {
                throw new Error("Unauthorized: Only project owner can invite team members");
            }

            const freelancer = await User.findById(freelancerId);
            if (!freelancer) throw new Error("Freelancer not found");

            // Create notification
            await Notification.create({
                userId: freelancerId,
                type: 'collabo_invite',
                title: 'Team Invitation',
                message: `${(project.clientId as any).firstName} invited you to join "${project.title}" as ${role.title}`,
                relatedId: roleId,
                relatedType: 'project',
                link: `/collabo/invite/${roleId}`,
                isRead: false
            });

            // Send email
            try {
                const emailHtml = getBaseTemplate({
                    title: 'You\'re Invited to Join a Team!',
                    subject: `Invitation to join ${project.title}`,
                    content: `
                        <p>Hi ${freelancer.firstName},</p>
                        <p><strong>${(project.clientId as any).firstName} ${(project.clientId as any).lastName}</strong> has invited you to join their team!</p>
                        <h3 style="color: #111827; margin: 20px 0;">${project.title}</h3>
                        <p><strong>Role:</strong> ${role.title}</p>
                        <p><strong>Budget:</strong> ₦${role.budget.toLocaleString()}</p>
                        <p>Review the invitation and accept to join the team.</p>
                    `,
                    actionUrl: `${process.env.CLIENT_URL || 'https://app.myconnecta.ng'}/collabo/invite/${roleId}`,
                    actionText: 'View Invitation'
                });

                await sendEmail(
                    freelancer.email,
                    `Team Invitation: ${project.title}`,
                    emailHtml
                );
            } catch (emailError) {
                console.error('Failed to send invitation email:', emailError);
            }

            return { success: true, message: 'Invitation sent successfully' };
        } catch (error) {
            console.error("Invite To Role Error:", error);
            throw error;
        }
    }

    async getRole(roleId: string) {
        // Return role with project details
        const role = await ProjectRole.findById(roleId);
        if (!role) throw new Error("Role not found");
        const project = await CollaboProject.findById(role.projectId).populate('clientId', 'firstName lastName avatar');
        return { role, project };
    }

    async addRole(projectId: string, clientId: string, roleData: { title: string; description: string; budget: number; skills: string[] }) {
        const project = await CollaboProject.findById(projectId);
        if (!project) throw new Error("Project not found");

        if (project.clientId.toString() !== clientId) {
            throw new Error("Unauthorized: Only project owner can add roles");
        }

        const newRole = await ProjectRole.create({
            projectId: project._id,
            title: roleData.title,
            description: roleData.description,
            budget: roleData.budget,
            skills: roleData.skills,
            status: 'open'
        });

        return newRole;
    }

    async sendMessage(workspaceId: string, channelName: string, senderId: string, senderRole: string, content: string) {
        const message = await CollaboMessage.create({
            workspaceId,
            channelName,
            senderId,
            senderRole,
            content
        });

        await message.populate('senderId', 'firstName lastName avatar');

        // Update unread counts
        try {
            const workspace = await CollaboWorkspace.findById(workspaceId);
            if (workspace) {
                const project = await CollaboProject.findById(workspace.projectId);
                if (project) {
                    const recipients = new Set<string>();

                    // Add Client
                    if (project.clientId.toString() !== senderId) {
                        recipients.add(project.clientId.toString());
                    }

                    // Add Freelancers in the channel
                    const channel = workspace.channels.find(c => c.name === channelName);
                    if (channel) {
                        const roles = await ProjectRole.find({
                            _id: { $in: channel.roleIds },
                            status: 'filled'
                        });

                        roles.forEach(role => {
                            if (role.freelancerId && role.freelancerId.toString() !== senderId) {
                                recipients.add(role.freelancerId.toString());
                            }
                        });
                    }

                    // Increment unread count for recipients
                    const updateOps: any = {};
                    recipients.forEach(userId => {
                        updateOps[`unreadCount.${userId}`] = 1;
                    });

                    if (Object.keys(updateOps).length > 0) {
                        await CollaboWorkspace.findByIdAndUpdate(workspaceId, {
                            $inc: updateOps
                        });
                    }
                }
            }

            getIO().to(workspaceId).emit('collabo:message', message);
            // Emit conversation update to trigger badge refresh
            getIO().to(workspaceId).emit('conversation:update');
        } catch (e) {
            console.error("Socket emit or unread update failed", e);
        }

        return message;
    }

    async getMessages(workspaceId: string, channelName: string) {
        return CollaboMessage.find({ workspaceId, channelName })
            .populate('senderId', 'firstName lastName avatar')
            .sort({ createdAt: 1 });
    }

    // Task Management
    async createTask(data: any) {
        const task = await CollaboTask.create(data);
        return task.populate('assigneeId', 'firstName lastName avatar');
    }

    async getTasks(workspaceId: string) {
        return CollaboTask.find({ workspaceId })
            .populate('assigneeId', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
    }

    async updateTask(taskId: string, updates: any) {
        const task = await CollaboTask.findByIdAndUpdate(taskId, updates, { new: true })
            .populate('assigneeId', 'firstName lastName avatar');

        try {
            getIO().to(task?.workspaceId.toString() || '').emit('collabo:task_update', task);
        } catch (e) { console.log("Socket emit error", e) }

        return task;
    }

    // File Management
    async addFile(data: any) {
        const file = await CollaboFile.create(data);
        const populatedFile = await file.populate('uploaderId', 'firstName lastName avatar');

        try {
            getIO().to(data.workspaceId).emit('collabo:file_upload', populatedFile);
        } catch (e) {
            console.error("Socket emit failed for file upload", e);
        }

        return populatedFile;
    }

    async getFiles(workspaceId: string) {
        return CollaboFile.find({ workspaceId })
            .populate('uploaderId', 'firstName lastName avatar')
            .sort({ createdAt: -1 });
    }
    async deleteTask(taskId: string) {
        const task = await CollaboTask.findByIdAndDelete(taskId);
        if (!task) throw new Error("Task not found");

        try {
            getIO().to(task.workspaceId.toString()).emit('collabo:task_delete', taskId);
        } catch (e) { console.log("Socket emit error", e) }

        return { success: true };
    }

    async deleteFile(fileId: string) {
        const file = await CollaboFile.findByIdAndDelete(fileId);
        if (!file) throw new Error("File not found");

        try {
            getIO().to(file.workspaceId.toString()).emit('collabo:file_delete', fileId);
        } catch (e) { console.log("Socket emit error", e) }

        return { success: true };
    }

    async markWorkspaceRead(workspaceId: string, userId: string) {
        await CollaboWorkspace.findByIdAndUpdate(workspaceId, {
            [`unreadCount.${userId}`]: 0
        });

        // Emit conversation update to refresh badge
        try {
            getIO().to(userId).emit('conversation:update');
        } catch (e) { console.log("Socket emit error", e) }

        return { success: true };
    }
}

export default new CollaboService();

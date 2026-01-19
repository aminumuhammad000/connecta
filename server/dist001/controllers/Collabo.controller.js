"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = exports.uploadFile = exports.updateTask = exports.getTasks = exports.createTask = exports.getMessages = exports.sendMessage = exports.getRole = exports.acceptRole = exports.getMyProjects = exports.activateProject = exports.fundProject = exports.scopeProject = exports.getCollaboProject = exports.createCollaboProject = void 0;
const Collabo_service_1 = __importDefault(require("../services/Collabo.service"));
const Payment_model_1 = __importDefault(require("../models/Payment.model"));
const flutterwave_service_1 = __importDefault(require("../services/flutterwave.service"));
const user_model_1 = __importDefault(require("../models/user.model"));
const CollaboProject_model_1 = __importDefault(require("../models/CollaboProject.model"));
const createCollaboProject = async (req, res) => {
    try {
        const clientId = req.user._id;
        const { title, description, totalBudget, roles, milestones, recommendedStack, risks, category, niche, projectType, scope, duration, durationType } = req.body;
        console.log("Creating Collabo Project:", JSON.stringify(req.body, null, 2));
        const result = await Collabo_service_1.default.createCollaboProject(clientId, {
            title,
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
    }
    catch (error) {
        console.error('Create Collabo Project Error:', error);
        res.status(500).json({ message: 'Failed to create project', error: error.message });
    }
};
exports.createCollaboProject = createCollaboProject;
const getCollaboProject = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Collabo_service_1.default.getProjectDetails(id);
        if (!result.project)
            return res.status(404).json({ message: "Project not found" });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch project', error: error.message });
    }
};
exports.getCollaboProject = getCollaboProject;
const scopeProject = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description)
            return res.status(400).json({ message: "Description is required" });
        const result = await Collabo_service_1.default.scopeProject(description);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to scope project', error: error.message });
    }
};
exports.scopeProject = scopeProject;
const fundProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const project = await CollaboProject_model_1.default.findById(id);
        if (!project)
            return res.status(404).json({ message: "Project not found" });
        if (project.clientId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const amount = project.totalBudget;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid project budget" });
        }
        // Create Payment
        const user = await user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const payment = new Payment_model_1.default({
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
        const flutterwaveResponse = await flutterwave_service_1.default.initializePayment(user.email, amount, payment._id.toString(), { collaboProjectId: project._id, type: 'collabo_funding' });
        payment.gatewayReference = payment._id.toString();
        await payment.save();
        res.json({
            paymentId: payment._id,
            authorizationUrl: flutterwaveResponse.data.link,
            reference: payment._id.toString()
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to initiate funding', error: error.message });
    }
};
exports.fundProject = fundProject;
const activateProject = async (req, res) => {
    try {
        const { id } = req.params;
        // In real app, verify payment reference here using PaymentService
        const result = await Collabo_service_1.default.activateProject(id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to activate project', error: error.message });
    }
};
exports.activateProject = activateProject;
const getMyProjects = async (req, res) => {
    try {
        const clientId = req.user._id;
        const result = await Collabo_service_1.default.getClientProjects(clientId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
};
exports.getMyProjects = getMyProjects;
const acceptRole = async (req, res) => {
    try {
        const { roleId } = req.body;
        const freelancerId = req.user._id;
        const result = await Collabo_service_1.default.acceptRole(roleId, freelancerId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to accept role', error: error.message });
    }
};
exports.acceptRole = acceptRole;
const getRole = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Collabo_service_1.default.getRole(id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to get role', error: error.message });
    }
};
exports.getRole = getRole;
const sendMessage = async (req, res) => {
    try {
        const { workspaceId, channelName, content, senderRole } = req.body;
        const senderId = req.user._id;
        const result = await Collabo_service_1.default.sendMessage(workspaceId, channelName, senderId, senderRole, content);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const { workspaceId, channelName } = req.query;
        const result = await Collabo_service_1.default.getMessages(workspaceId, channelName);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
};
exports.getMessages = getMessages;
// Task Management
const createTask = async (req, res) => {
    try {
        const { workspaceId, title, description, priority, assigneeId, dueDate } = req.body;
        const createdBy = req.user._id;
        const task = await Collabo_service_1.default.createTask({
            workspaceId,
            title,
            description,
            priority,
            assigneeId,
            createdBy,
            dueDate
        });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        const tasks = await Collabo_service_1.default.getTasks(workspaceId);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
};
exports.getTasks = getTasks;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const task = await Collabo_service_1.default.updateTask(id, updates);
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
};
exports.updateTask = updateTask;
// File Management
const uploadFile = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        const { workspaceId } = req.body;
        const uploaderId = req.user._id;
        const file = await Collabo_service_1.default.addFile({
            workspaceId,
            uploaderId,
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}` // Serving static files
        });
        res.json(file);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to upload file', error: error.message });
    }
};
exports.uploadFile = uploadFile;
const getFiles = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        const files = await Collabo_service_1.default.getFiles(workspaceId);
        res.json(files);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch files', error: error.message });
    }
};
exports.getFiles = getFiles;

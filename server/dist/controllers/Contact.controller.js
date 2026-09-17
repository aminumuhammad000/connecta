import { Contact } from "../models/Contact.model.js";
export const submitContactForm = async (req, res) => {
    try {
        const user = req.user;
        const { name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Connecta User' : '', email = user?.email || '', subject, message, category = 'General Support', priority = 'medium', } = req.body;
        // Basic Validation
        if (!email || !subject || !message) {
            return res.status(400).json({ success: false, message: "Email, subject, and message are required" });
        }
        // Create new contact/support ticket entry
        const newContact = new Contact({
            userId: user?._id || user?.id || req.body.userId || undefined,
            name: name || user?.email || 'Connecta User',
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            category: category || 'General Support',
            priority: priority || 'medium',
            status: 'Submitted',
        });
        await newContact.save();
        res.status(201).json({
            success: true,
            message: "Support request submitted successfully",
            data: newContact
        });
    }
    catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
export const getMyContactMessages = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const userId = user._id || user.id;
        const userEmail = user.email ? user.email.toLowerCase() : null;
        const query = {
            $or: [
                ...(userId ? [{ userId }] : []),
                ...(userEmail ? [{ email: userEmail }] : []),
            ]
        };
        const tickets = await Contact.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: tickets
        });
    }
    catch (error) {
        console.error("Error fetching user support tickets:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
export const getAllContactMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body;
        const updatePayload = {};
        if (status)
            updatePayload.status = status;
        if (adminResponse !== undefined)
            updatePayload.adminResponse = adminResponse;
        const updated = await Contact.findByIdAndUpdate(id, updatePayload, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Support ticket not found" });
        }
        res.status(200).json({
            success: true,
            message: "Support ticket updated successfully",
            data: updated
        });
    }
    catch (error) {
        console.error("Error updating support ticket status:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

import { Request, Response } from "express";
import { Contact } from "../models/Contact.model.js";

export const submitContactForm = async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create new contact entry
        const newContact = new Contact({
            name,
            email,
            subject,
            message,
        });

        await newContact.save();

        res.status(201).json({
            message: "Message sent successfully",
            data: newContact
        });

    } catch (error: any) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

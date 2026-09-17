import express from "express";
import {
    submitContactForm,
    getMyContactMessages,
    getAllContactMessages,
    updateContactStatus
} from "../controllers/Contact.controller.js";
import { authenticate, optionalAuthenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';

const router = express.Router();

router.post("/", optionalAuthenticate, submitContactForm);
router.get("/my-tickets", authenticate, getMyContactMessages);
router.get("/", authenticate, isAdmin, getAllContactMessages);
router.put("/:id/status", authenticate, isAdmin, updateContactStatus);

export default router;

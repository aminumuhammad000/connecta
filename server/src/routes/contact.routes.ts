import express from "express";
import { submitContactForm, getAllContactMessages } from "../controllers/Contact.controller.js";
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';

const router = express.Router();

router.post("/", submitContactForm);
router.get("/", authenticate, isAdmin, getAllContactMessages);

export default router;

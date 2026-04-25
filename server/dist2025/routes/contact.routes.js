import express from "express";
import { submitContactForm, getAllContactMessages } from "../controllers/Contact.controller.js";
const router = express.Router();
router.post("/", submitContactForm);
router.get("/", getAllContactMessages);
export default router;

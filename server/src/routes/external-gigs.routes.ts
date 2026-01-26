import { Router } from "express";
import {
    createOrUpdateExternalGig,
    deleteExternalGig,
    getAllExternalGigs,
} from "../controllers/external-gigs.controller.js";
import { apiKeyAuth } from "../core/middleware/apiKeyAuth.js";

const router = Router();

// API Key authentication for all routes
router.use(apiKeyAuth);

// Routes
router.post("/", createOrUpdateExternalGig);
router.delete("/:source/:externalId", deleteExternalGig);
router.get("/", getAllExternalGigs);

export default router;

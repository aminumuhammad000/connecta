"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/Job.routes.ts
const express_1 = __importDefault(require("express"));
const Job_controller_1 = require("../controllers/Job.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = express_1.default.Router();
// Get jobs for the current client (protected)
router.get("/client/my-jobs", auth_middleware_1.authenticate, Job_controller_1.getClientJobs);
// Get all jobs with filters
router.get("/", Job_controller_1.getAllJobs);
// Get recommended jobs (Jobs You May Like)
router.get("/recommended", Job_controller_1.getRecommendedJobs);
// Search jobs
router.get("/search", Job_controller_1.searchJobs);
// Get job by ID
router.get("/:id", Job_controller_1.getJobById);
// Create new job (protected)
router.post("/", auth_middleware_1.authenticate, Job_controller_1.createJob);
// Update job
router.put("/:id", Job_controller_1.updateJob);
// Delete job
router.delete("/:id", Job_controller_1.deleteJob);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Project_controller_1 = require("../controllers/Project.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all projects (admin)
router.get('/', Project_controller_1.getAllProjects);
// Get logged-in client's own projects (protected)
router.get('/client/my-projects', auth_middleware_1.authenticate, Project_controller_1.getMyProjects);
// Get projects for a specific freelancer
router.get('/freelancer/:freelancerId', Project_controller_1.getFreelancerProjects);
// Get projects for a specific client
router.get('/client/:clientId', Project_controller_1.getClientProjects);
// Get project statistics
router.get('/stats/:userId', Project_controller_1.getProjectStats);
// Get single project by ID
router.get('/:id', Project_controller_1.getProjectById);
// Create a new project
router.post('/', Project_controller_1.createProject);
// Update project
router.put('/:id', Project_controller_1.updateProject);
// Update project status
router.patch('/:id/status', Project_controller_1.updateProjectStatus);
// Add file upload to project
router.post('/:id/upload', Project_controller_1.addProjectUpload);
// Add activity to project
router.post('/:id/activity', Project_controller_1.addProjectActivity);
// Delete project
router.delete('/:id', Project_controller_1.deleteProject);
exports.default = router;

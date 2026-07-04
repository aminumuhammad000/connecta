import { Router } from 'express';
import { getAllProjects, getFreelancerProjects, getClientProjects, getMyProjects, getProjectById, createProject, updateProject, updateProjectStatus, addProjectUpload, addProjectActivity, submitProject, acceptProjectSubmission, requestRevision, deleteProject, getProjectStats, } from '../controllers/Project.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
const router = Router();
// Get all projects (admin)
router.get('/', getAllProjects);
// Get logged-in client's own projects (protected)
router.get('/client/my-projects', authenticate, getMyProjects);
// Get projects for a specific freelancer
router.get('/freelancer/:freelancerId', getFreelancerProjects);
// Get projects for a specific client
router.get('/client/:clientId', getClientProjects);
// Get project statistics
router.get('/stats/:userId', getProjectStats);
// Get single project by ID
router.get('/:id', getProjectById);
// Create a new project
router.post('/', createProject);
// Update project
router.put('/:id', updateProject);
// Update project status
router.patch('/:id/status', updateProjectStatus);
// Submit project
router.post('/:id/submit', authenticate, submitProject);
// Accept project submission
router.patch('/:id/accept', authenticate, acceptProjectSubmission);
// Request revision
router.patch('/:id/request-revision', authenticate, requestRevision);
// Add file upload to project
router.post('/:id/upload', addProjectUpload);
// Add activity to project
router.post('/:id/activity', addProjectActivity);
// Delete project
router.delete('/:id', deleteProject);
export default router;

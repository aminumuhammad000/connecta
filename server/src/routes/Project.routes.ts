import { Router } from 'express';
import {
  getAllProjects,
  getFreelancerProjects,
  getClientProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  addProjectUpload,
  addProjectActivity,
  deleteProject,
  getProjectStats,
} from '../controllers/Project.controller';

const router = Router();

// Get all projects (admin)
router.get('/', getAllProjects);

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

// Add file upload to project
router.post('/:id/upload', addProjectUpload);

// Add activity to project
router.post('/:id/activity', addProjectActivity);

// Delete project
router.delete('/:id', deleteProject);

export default router;

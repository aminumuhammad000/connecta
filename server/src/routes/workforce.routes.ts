import express from 'express';
import {
  getDashboardStats,
  getSettings,
  saveSettings,
  getWorkers,
  addWorker,
  bulkImportWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getAttendance,
  recordCheckIn,
  recordCheckOut,
  markAttendance,
  getContracts,
  createContract,
  acceptContract,
  declineContract,
  getPayments,
  processPayment,
  getWorkerMeData,
  getPublicWorkforceInfo,
  getWorkforceJobs,
  updateWorkerPayoutStatus,
  fundPayrollWallet,
} from '../controllers/Workforce.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';

const router = express.Router();

// Public Workforce Info (unauthenticated signup link resolution)
router.get('/public/:workforceId', getPublicWorkforceInfo);

// All workforce routes below require JWT authentication
router.use(authenticate);

// Workforce Employer Jobs Only
router.get('/jobs', getWorkforceJobs);

// Dashboard & Settings
router.get('/dashboard', getDashboardStats);
router.get('/settings', getSettings);
router.put('/settings', saveSettings);
router.post('/wallet/fund', fundPayrollWallet);

// Workers
router.get('/workers', getWorkers);
router.post('/workers', addWorker);
router.post('/workers/import', bulkImportWorkers);
router.get('/workers/:workerId', getWorkerById);
router.put('/workers/:workerId/payout-status', updateWorkerPayoutStatus);
router.put('/workers/:workerId', updateWorker);
router.delete('/workers/:workerId', deleteWorker);

// Attendance
router.get('/attendance', getAttendance);
router.post('/attendance/check-in', recordCheckIn);
router.post('/attendance/check-out', recordCheckOut);
router.post('/attendance/mark', markAttendance);

// Worker Me Experience
router.get('/me', getWorkerMeData);

// Contracts
router.get('/contracts', getContracts);
router.post('/contracts', createContract);
router.put('/contracts/:contractId/accept', acceptContract);
router.put('/contracts/:contractId/decline', declineContract);

// Payments
router.get('/payments', getPayments);
router.post('/payments', processPayment);

export default router;

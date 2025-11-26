import { Router } from 'express';
import {
  initializePayment,
  initializeJobVerification,
  verifyPayment,
  releasePayment,
  refundPayment,
  getPaymentHistory,
  getAllPayments,
  getWalletBalance,
  requestWithdrawal,
  processWithdrawal,
  getTransactionHistory,
  getBanks,
  resolveAccount,
} from '../controllers/payment.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = Router();

// Admin route - Get all payments (no auth)
router.get('/admin/all', getAllPayments);

// Payment routes
router.post('/initialize', authenticate, initializePayment);
router.post('/job-verification', authenticate, initializeJobVerification);
router.get('/verify/:reference', authenticate, verifyPayment);
router.post('/:paymentId/release', authenticate, releasePayment);
router.post('/:paymentId/refund', authenticate, refundPayment);
router.get('/history', authenticate, getPaymentHistory);

// Wallet routes
router.get('/wallet/balance', authenticate, getWalletBalance);
router.get('/transactions', authenticate, getTransactionHistory);

// Withdrawal routes
router.post('/withdrawal/request', authenticate, requestWithdrawal);
router.post('/withdrawal/:withdrawalId/process', authenticate, processWithdrawal);

// Bank routes
router.get('/banks', authenticate, getBanks);
router.post('/banks/resolve', authenticate, resolveAccount);

export default router;

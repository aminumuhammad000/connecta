import { Router } from 'express';
import {
  initializeTopup,
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
  saveWithdrawalSettings,
  getPendingWithdrawals,
  getAllWithdrawals,
  getAllWallets,
} from '../controllers/payment.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';

const router = Router();

// Admin route - Get all payments (no auth)
router.get('/admin/all', getAllPayments);
router.get('/admin/withdrawals', authenticate, getPendingWithdrawals);
router.get('/admin/withdrawals/all', authenticate, getAllWithdrawals);
router.get('/admin/wallets/all', authenticate, getAllWallets);

// Payment routes
router.post('/initialize', authenticate, initializePayment);
router.post('/initialize-topup', authenticate, initializeTopup);
router.post('/job-verification', authenticate, initializeJobVerification);
router.get('/verify/:reference', authenticate, verifyPayment);
router.post('/:paymentId/release', authenticate, releasePayment);
router.post('/:paymentId/refund', authenticate, refundPayment);
router.get('/history', authenticate, getPaymentHistory);

// Wallet routes
router.get('/wallet/balance', authenticate, getWalletBalance);
router.post('/wallet/settings', authenticate, saveWithdrawalSettings);
router.get('/transactions', authenticate, getTransactionHistory);

// Withdrawal routes
router.post('/withdrawal/request', authenticate, requestWithdrawal);
router.post('/withdrawal/:withdrawalId/process', authenticate, processWithdrawal);

// Bank routes
router.get('/banks', authenticate, getBanks);
router.post('/banks/resolve', authenticate, resolveAccount);

export default router;

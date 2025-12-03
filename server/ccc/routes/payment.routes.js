"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Admin route - Get all payments (no auth)
router.get('/admin/all', payment_controller_1.getAllPayments);
// Payment routes
router.post('/initialize', auth_middleware_1.authenticate, payment_controller_1.initializePayment);
router.post('/job-verification', auth_middleware_1.authenticate, payment_controller_1.initializeJobVerification);
router.get('/verify/:reference', auth_middleware_1.authenticate, payment_controller_1.verifyPayment);
router.post('/:paymentId/release', auth_middleware_1.authenticate, payment_controller_1.releasePayment);
router.post('/:paymentId/refund', auth_middleware_1.authenticate, payment_controller_1.refundPayment);
router.get('/history', auth_middleware_1.authenticate, payment_controller_1.getPaymentHistory);
// Wallet routes
router.get('/wallet/balance', auth_middleware_1.authenticate, payment_controller_1.getWalletBalance);
router.get('/transactions', auth_middleware_1.authenticate, payment_controller_1.getTransactionHistory);
// Withdrawal routes
router.post('/withdrawal/request', auth_middleware_1.authenticate, payment_controller_1.requestWithdrawal);
router.post('/withdrawal/:withdrawalId/process', auth_middleware_1.authenticate, payment_controller_1.processWithdrawal);
// Bank routes
router.get('/banks', auth_middleware_1.authenticate, payment_controller_1.getBanks);
router.post('/banks/resolve', auth_middleware_1.authenticate, payment_controller_1.resolveAccount);
exports.default = router;

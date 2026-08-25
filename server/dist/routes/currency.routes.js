import express from 'express';
import { getCurrencies, createCurrency, updateCurrency, toggleCurrencyStatus, deleteCurrency, } from '../controllers/Currency.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';
const router = express.Router();
// Public route to fetch currencies for dropdowns across web & app
router.get('/', getCurrencies);
// Admin routes to manage currencies
router.post('/', authenticate, isAdmin, createCurrency);
router.put('/:id', authenticate, isAdmin, updateCurrency);
router.patch('/:id/toggle', authenticate, isAdmin, toggleCurrencyStatus);
router.delete('/:id', authenticate, isAdmin, deleteCurrency);
export default router;

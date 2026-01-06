"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
// import { authenticate, authorize } from '../core/middleware/auth.middleware'; // Assuming we have auth middleware
const router = (0, express_1.Router)();
// TODO: Add authentication and authorization (admin only)
// router.use(authenticate);
// router.use(authorize('admin'));
router.get('/', settings_controller_1.getSettings);
router.put('/smtp', settings_controller_1.updateSmtpSettings);
router.put('/api-keys', settings_controller_1.updateApiKeys);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Secure all settings routes
router.use(auth_middleware_1.authenticate);
// TODO: Add refined authorization (e.g. admin only) for specific routes if needed
// router.use(authorize('admin'));
router.get('/', settings_controller_1.getSettings);
router.put('/smtp', settings_controller_1.updateSmtpSettings);
router.put('/api-keys', settings_controller_1.updateApiKeys);
exports.default = router;

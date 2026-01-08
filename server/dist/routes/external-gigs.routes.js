"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const external_gigs_controller_1 = require("../controllers/external-gigs.controller");
const apiKeyAuth_1 = require("../core/middleware/apiKeyAuth");
const router = (0, express_1.Router)();
// API Key authentication for all routes
router.use(apiKeyAuth_1.apiKeyAuth);
// Routes
router.post("/", external_gigs_controller_1.createOrUpdateExternalGig);
router.delete("/:source/:externalId", external_gigs_controller_1.deleteExternalGig);
router.get("/", external_gigs_controller_1.getAllExternalGigs);
exports.default = router;

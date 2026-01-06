"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const proposalImprovements_controller_1 = require("../controllers/proposalImprovements.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = express_1.default.Router();
// Proposal editing
router.put('/:proposalId/edit', auth_middleware_1.authenticate, proposalImprovements_controller_1.editProposal);
// Proposal withdrawal
router.post('/:proposalId/withdraw', auth_middleware_1.authenticate, proposalImprovements_controller_1.withdrawProposal);
// Counter-offers
router.post('/:proposalId/counter-offer', auth_middleware_1.authenticate, proposalImprovements_controller_1.createCounterOffer);
router.post('/:proposalId/counter-offer/:offerIndex/respond', auth_middleware_1.authenticate, proposalImprovements_controller_1.respondToCounterOffer);
// Templates
router.post('/templates', auth_middleware_1.authenticate, proposalImprovements_controller_1.createProposalTemplate);
router.get('/templates', auth_middleware_1.authenticate, proposalImprovements_controller_1.getProposalTemplates);
router.post('/templates/:templateId/use', auth_middleware_1.authenticate, proposalImprovements_controller_1.useTemplate);
router.delete('/templates/:templateId', auth_middleware_1.authenticate, proposalImprovements_controller_1.deleteProposalTemplate);
// Expiry handling (admin or cron)
router.post('/expire-old', proposalImprovements_controller_1.handleExpiredProposals);
exports.default = router;

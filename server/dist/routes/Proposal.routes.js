"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Proposal_controller_1 = require("../controllers/Proposal.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all proposals (admin/general)
router.get('/', Proposal_controller_1.getAllProposals);
// Get accepted proposals for client (protected)
router.get('/client/accepted', auth_middleware_1.authenticate, Proposal_controller_1.getClientAcceptedProposals);
// Get proposals for a specific freelancer
router.get('/freelancer/:freelancerId', Proposal_controller_1.getFreelancerProposals);
// Get proposal statistics for a freelancer
router.get('/stats/:freelancerId', Proposal_controller_1.getProposalStats);
// Approve a proposal (protected)
router.put('/:id/approve', auth_middleware_1.authenticate, Proposal_controller_1.approveProposal);
// Reject a proposal (protected)
router.put('/:id/reject', auth_middleware_1.authenticate, Proposal_controller_1.rejectProposal);
// Get single proposal by ID
router.get('/:id', Proposal_controller_1.getProposalById);
// Create a new proposal (protected)
router.post('/', auth_middleware_1.authenticate, Proposal_controller_1.createProposal);
// Update proposal status (accept/decline)
router.patch('/:id/status', Proposal_controller_1.updateProposalStatus);
// Update proposal
router.put('/:id', Proposal_controller_1.updateProposal);
// Delete proposal
router.delete('/:id', Proposal_controller_1.deleteProposal);
exports.default = router;

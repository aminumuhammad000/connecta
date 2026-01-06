"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contract_controller_1 = require("../controllers/contract.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = express_1.default.Router();
// Admin route - Get all contracts (no auth)
router.get('/admin/all', contract_controller_1.getAllContracts);
// Create contract (protected - client only)
router.post('/', auth_middleware_1.authenticate, contract_controller_1.createContract);
// Get user's contracts (protected)
router.get('/', auth_middleware_1.authenticate, contract_controller_1.getUserContracts);
// Get contract template (public)
router.get('/templates/:type', contract_controller_1.getContractTemplate);
// Get contract by ID (protected)
router.get('/:contractId', auth_middleware_1.authenticate, contract_controller_1.getContractById);
// Sign contract (protected)
router.post('/:contractId/sign', auth_middleware_1.authenticate, contract_controller_1.signContract);
// Terminate contract (protected)
router.post('/:contractId/terminate', auth_middleware_1.authenticate, contract_controller_1.terminateContract);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const portfolio_controller_1 = require("../controllers/portfolio.controller");
const router = express_1.default.Router();
// Get portfolio items (can be public or protected, but let's default to protected/checking profile visibility)
// For now, allow viewing any user's portfolio by ID
router.get('/:userId', auth_middleware_1.authenticate, portfolio_controller_1.getPortfolioItems);
// Protected routes (Self management)
router.post('/', auth_middleware_1.authenticate, portfolio_controller_1.addPortfolioItem);
router.delete('/:id', auth_middleware_1.authenticate, portfolio_controller_1.deletePortfolioItem);
exports.default = router;

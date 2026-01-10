"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const support_controller_1 = require("../controllers/support.controller");
const router = express_1.default.Router();
router.post("/explain", support_controller_1.explainFeature);
router.get("/help", support_controller_1.getHelp);
router.post("/feedback", support_controller_1.sendFeedback);
router.post("/onboarding", support_controller_1.onboarding);
exports.default = router;

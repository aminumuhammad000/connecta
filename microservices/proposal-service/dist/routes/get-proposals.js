"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProposalsByJobRouter = void 0;
const express_1 = __importDefault(require("express"));
const proposal_1 = require("../models/proposal");
const router = express_1.default.Router();
exports.getProposalsByJobRouter = router;
router.get('/api/proposals/job/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId } = req.params;
    const proposals = yield proposal_1.Proposal.findAll({
        where: { jobId }
    });
    res.send(proposals);
}));

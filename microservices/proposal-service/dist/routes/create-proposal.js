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
exports.createProposalRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@connecta/common");
const proposal_1 = require("../models/proposal");
const proposal_created_publisher_1 = require("../events/publishers/proposal-created-publisher");
const rabbitmq_wrapper_1 = require("../rabbitmq-wrapper");
const router = express_1.default.Router();
exports.createProposalRouter = router;
router.post('/api/proposals', [
    (0, express_validator_1.body)('jobId').not().isEmpty().withMessage('Job ID is required'),
    (0, express_validator_1.body)('coverLetter').not().isEmpty().withMessage('Cover letter is required'),
    (0, express_validator_1.body)('bidAmount').isFloat({ gt: 0 }).withMessage('Bid amount must be greater than 0'),
    (0, express_validator_1.body)('duration').not().isEmpty().withMessage('Duration is required'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId, coverLetter, bidAmount, duration } = req.body;
    // Mock freelancerId (until auth middleware)
    const freelancerId = req.headers['x-user-id'];
    if (!freelancerId) {
        throw new common_1.BadRequestError('User ID missing (Simulation: provide x-user-id header)');
    }
    const proposal = yield proposal_1.Proposal.create({
        jobId,
        freelancerId,
        coverLetter,
        bidAmount,
        duration,
        status: 'pending'
    });
    yield new proposal_created_publisher_1.ProposalCreatedPublisher(rabbitmq_wrapper_1.rabbitMQWrapper.channel).publish({
        id: proposal.id,
        jobId: proposal.jobId,
        freelancerId: proposal.freelancerId,
        bidAmount: proposal.bidAmount,
        duration: proposal.duration,
        status: proposal.status,
        version: 1,
    });
    res.status(201).send(proposal);
}));

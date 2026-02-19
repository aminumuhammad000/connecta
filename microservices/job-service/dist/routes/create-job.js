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
exports.createJobRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@connecta/common"); // we will need requireAuth later
const job_1 = require("../models/job");
const job_created_publisher_1 = require("../events/publishers/job-created-publisher");
const rabbitmq_wrapper_1 = require("../rabbitmq-wrapper");
const router = express_1.default.Router();
exports.createJobRouter = router;
router.post('/api/jobs', [
    (0, express_validator_1.body)('title').not().isEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').not().isEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('budget').isFloat({ gt: 0 }).withMessage('Budget must be greater than 0'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, budget } = req.body;
    // Mock userId for now until we have auth middleware in this service
    // In real implementation: const userId = req.currentUser!.id;
    const userId = req.headers['x-user-id'];
    if (!userId) {
        throw new common_1.BadRequestError('User ID missing (Simulation: provide x-user-id header)');
    }
    const job = job_1.Job.build({
        title,
        description,
        budget,
        userId,
    });
    yield job.save();
    yield new job_created_publisher_1.JobCreatedPublisher(rabbitmq_wrapper_1.rabbitMQWrapper.channel).publish({
        id: job.id,
        title: job.title,
        description: job.description,
        budget: job.budget,
        userId: job.userId,
        version: job.version,
    });
    res.status(201).send(job);
}));

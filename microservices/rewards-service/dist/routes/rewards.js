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
exports.rewardsRouter = void 0;
const express_1 = __importDefault(require("express"));
const spark_transaction_1 = require("../models/spark-transaction");
const common_1 = require("@connecta/common");
const router = express_1.default.Router();
exports.rewardsRouter = router;
router.get('/api/rewards/balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Mock user ID (until auth middleware)
    const userId = req.headers['x-user-id'];
    if (!userId) {
        throw new common_1.BadRequestError('User ID missing (Simulation: provide x-user-id header)');
    }
    const transactions = yield spark_transaction_1.SparkTransaction.findAll({
        where: { userId }
    });
    const balance = transactions.reduce((acc, txn) => acc + txn.amount, 0);
    res.send({ userId, balance });
}));
router.post('/api/rewards/transaction', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This is a simplified internal/admin route for demo purposes
    // IN REAL APP: This would likely happen via Events (JobCompleted) or internal logic
    const { userId, amount, type, description, referenceId } = req.body;
    const transaction = yield spark_transaction_1.SparkTransaction.create({
        userId,
        amount,
        type,
        description,
        referenceId
    });
    res.status(201).send(transaction);
}));

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
exports.showProfileRouter = void 0;
const express_1 = __importDefault(require("express"));
// import { requireAuth } from '@connecta/common'; // We need to export this from common
const common_1 = require("@connecta/common");
const profile_1 = require("../models/profile");
const router = express_1.default.Router();
exports.showProfileRouter = router;
// TODO: Add requireAuth middleware once exported from common
router.get('/api/profiles/currentuser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // For now, let's assume req.currentUser is set by invoke gateway or we use a header
    // In a real microservice, we trust the gateway or validate the JWT again
    // For this MVP, we will rely on x-user-id header passed by gateway
    const userId = req.headers['x-user-id'];
    if (!userId) {
        throw new common_1.NotFoundError();
    }
    const profile = yield profile_1.Profile.findOne({ userId });
    if (!profile) {
        throw new common_1.NotFoundError();
    }
    res.send(profile);
}));

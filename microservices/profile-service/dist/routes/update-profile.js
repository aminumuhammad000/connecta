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
exports.updateProfileRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@connecta/common");
const profile_1 = require("../models/profile");
const router = express_1.default.Router();
exports.updateProfileRouter = router;
router.put('/api/profiles/currentuser', [
    (0, express_validator_1.body)('bio').optional().isString(),
    (0, express_validator_1.body)('skills').optional().isArray(),
    (0, express_validator_1.body)('portfolio').optional().isArray(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        throw new common_1.BadRequestError('User ID missing');
    }
    const profile = yield profile_1.Profile.findOne({ userId });
    if (!profile) {
        throw new common_1.NotFoundError();
    }
    const { bio, skills, portfolio } = req.body;
    if (bio)
        profile.bio = bio;
    if (skills)
        profile.skills = skills;
    if (portfolio)
        profile.portfolio = portfolio;
    yield profile.save();
    res.send(profile);
}));

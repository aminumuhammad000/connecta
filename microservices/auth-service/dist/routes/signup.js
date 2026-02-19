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
exports.signupRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const common_1 = require("@connecta/common");
const user_model_1 = require("../models/user.model");
const password_1 = require("../services/password");
const router = express_1.default.Router();
exports.signupRouter = router;
router.post('/api/auth/signup', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = req.body;
    const existingUser = yield user_model_1.User.findOne({ where: { email } });
    if (existingUser) {
        throw new common_1.BadRequestError('Email in use');
    }
    const hashedPassword = yield password_1.Password.toHash(password);
    const user = yield user_model_1.User.create({
        email,
        passwordHash: hashedPassword,
        role: role || 'freelancer', // Default role
        isVerified: false
    });
    // Generate JWT
    const userJwt = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, process.env.JWT_KEY);
    // Store it on session object
    req.session = {
        jwt: userJwt,
    };
    res.status(201).send(user);
}));

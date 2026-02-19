"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUserRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
exports.currentUserRouter = router;
router.get('/api/auth/currentuser', (req, res) => {
    var _a;
    // If no session or JWT, return null
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt)) {
        return res.send({ currentUser: null });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(req.session.jwt, process.env.JWT_KEY);
        res.send({ currentUser: payload });
    }
    catch (err) {
        res.send({ currentUser: null });
    }
});

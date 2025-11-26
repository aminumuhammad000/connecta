"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Profile_controller_1 = require("../controllers/Profile.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/", Profile_controller_1.createProfile);
router.get("/", Profile_controller_1.getAllProfiles);
// Get profile for authenticated user
router.get("/me", auth_middleware_1.authenticate, Profile_controller_1.getMyProfile);
router.get("/:id", Profile_controller_1.getProfileById);
router.put("/:id", Profile_controller_1.updateProfile);
router.delete("/:id", Profile_controller_1.deleteProfile);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gigs_controller_1 = require("../controllers/gigs.controller");
const router = express_1.default.Router();
router.get("/matched", gigs_controller_1.getMatchedGigs);
router.post("/:gigId/apply", gigs_controller_1.applyToGig);
router.post("/:gigId/save", gigs_controller_1.saveGig);
router.get("/saved", gigs_controller_1.getSavedGigs);
router.get("/applications", gigs_controller_1.trackApplications);
router.get("/recommendations", gigs_controller_1.getRecommendedGigs);
exports.default = router;

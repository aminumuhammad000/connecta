import express from "express";
import {
  createCoverLetter,
  editCoverLetter,
  saveCoverLetter,
  getSavedCoverLetters,
} from "../controllers/proposal.controller";

const router = express.Router();

router.post("/cover-letter", createCoverLetter);
router.patch("/cover-letter/edit", editCoverLetter);
router.post("/cover-letter/save", saveCoverLetter);
router.get("/cover-letters", getSavedCoverLetters);

export default router;

import express from "express";
import {
  getOwnReposHandler,
  getUserReposHandler,
} from "../controllers/repo.controller";
import { getUserProfileHandler } from "../controllers/user.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { optionalDeserializeUser } from "../middleware/optionalDeserializeUser";
import { requireUser } from "../middleware/requireUser";

const router = express.Router();

// Get user profile
router.get("/:username", optionalDeserializeUser, getUserProfileHandler);

// Get list of repos
router.get("/my/repos", deserializeUser, requireUser, getOwnReposHandler);
router.get("/:username/repos", getUserReposHandler);

export default router;

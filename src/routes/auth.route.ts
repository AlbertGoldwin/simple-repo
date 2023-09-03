import express from "express";
import { logoutHandler } from "../controllers/auth.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";

const router = express.Router();

// Logout User
router.get("/logout", deserializeUser, requireUser, logoutHandler);

export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const repo_controller_1 = require("../controllers/repo.controller");
const user_controller_1 = require("../controllers/user.controller");
const deserializeUser_1 = require("../middleware/deserializeUser");
const optionalDeserializeUser_1 = require("../middleware/optionalDeserializeUser");
const requireUser_1 = require("../middleware/requireUser");
const router = express_1.default.Router();
// Get user profile
router.get("/:username", optionalDeserializeUser_1.optionalDeserializeUser, user_controller_1.getUserProfileHandler);
// Get list of repos
router.get("/my/repos", deserializeUser_1.deserializeUser, requireUser_1.requireUser, repo_controller_1.getOwnReposHandler);
router.get("/:username/repos", repo_controller_1.getUserReposHandler);
exports.default = router;

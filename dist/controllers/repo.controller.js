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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnReposHandler = exports.getUserReposHandler = void 0;
const repo_service_1 = require("../services/repo.service");
const prisma_1 = require("../utils/prisma");
const getUserReposHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.params.username;
        const query = req.query;
        const size = parseInt(query.size);
        if (Number.isNaN(size)) {
            return res.status(400).json({
                status: "error",
                message: "Size query param must be a number!",
            });
        }
        const repos = yield (0, repo_service_1.getGithubUserRepo)(username, size);
        console.log(repos.length);
        res.status(200).json({
            status: "success",
            data: repos.map((repo) => ({
                name: repo.name,
                private: repo.private,
                description: repo.description,
                language: repo.language,
                updatedAt: repo.updated_at,
            })),
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserReposHandler = getUserReposHandler;
const getOwnReposHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = res.locals.user;
        const query = req.query;
        const size = parseInt(query.size);
        if (Number.isNaN(size)) {
            return res.status(400).json({
                status: "error",
                message: "Size query param must be a number!",
            });
        }
        const userSession = yield prisma_1.prisma.userSession.findUnique({
            where: { userId: currentUser.id },
        });
        const repos = yield (0, repo_service_1.getGithubOwnRepo)(userSession === null || userSession === void 0 ? void 0 : userSession.accessToken, size);
        res.status(200).json({
            status: "success",
            data: repos.map((repo) => ({
                name: repo.name,
                private: repo.private,
                description: repo.description,
                language: repo.language,
                updatedAt: repo.updated_at,
            })),
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getOwnReposHandler = getOwnReposHandler;

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
exports.getUserProfileHandler = void 0;
const user_service_1 = require("../services/user.service");
const prisma_1 = require("../utils/prisma");
const getUserProfileHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.params.username;
        const currentUser = res.locals.user;
        const { id, login, name, email, avatar_url, followers, following, bio } = yield (0, user_service_1.getGithubUserProfile)(username);
        if (currentUser && currentUser.username !== username) {
            yield prisma_1.prisma.profileVisit.upsert({
                where: {
                    visitorId_visitedId: {
                        visitorId: currentUser.id,
                        visitedId: id,
                    },
                },
                create: {
                    visitorId: currentUser.id,
                    visitedId: id,
                },
                update: {
                    visitorId: currentUser.id,
                    visitedId: id,
                },
            });
        }
        const user = yield prisma_1.prisma.user.upsert({
            where: { id },
            create: {
                id,
                username: login,
                name,
                email,
                profilePic: avatar_url,
                bio,
                followers,
                following,
                visitCount: 1,
            },
            update: {
                username: login,
                name,
                email,
                profilePic: avatar_url,
                bio,
                followers,
                following,
                visitCount: { increment: 1 },
            },
        });
        const lastVisitors = yield prisma_1.prisma.profileVisit.findMany({
            where: { visitedId: id },
            take: 3,
            include: {
                visitor: { select: { username: true, profilePic: true } },
            },
            orderBy: { updatedAt: "desc" },
        });
        res.status(200).json({
            status: "success",
            data: {
                id,
                username: login,
                name: name,
                email: email,
                profilePic: avatar_url,
                bio: bio,
                following: following,
                followers: followers,
                visitCount: user.visitCount,
                lastVisitors: lastVisitors.map((user) => ({
                    id: user.visitorId,
                    username: user.visitor.username,
                    profilePic: user.visitor.profilePic,
                })),
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserProfileHandler = getUserProfileHandler;

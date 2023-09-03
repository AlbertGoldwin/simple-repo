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
exports.githubOauthHandler = exports.logoutHandler = exports.exclude = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const session_service_1 = require("../services/session.service");
const prisma_1 = require("../utils/prisma");
function exclude(user, keys) {
    for (let key of keys) {
        delete user[key];
    }
    return user;
}
exports.exclude = exclude;
const logoutHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = res.locals.user;
        res.cookie("token", "", { maxAge: -1 });
        const userSession = yield prisma_1.prisma.userSession.delete({
            where: { userId: currentUser.id },
        });
        yield (0, session_service_1.deleteGithubOauthToken)(userSession === null || userSession === void 0 ? void 0 : userSession.accessToken);
        res.status(200).json({ status: "success", message: "User logged out" });
    }
    catch (err) {
        next(err);
    }
});
exports.logoutHandler = logoutHandler;
const githubOauthHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = req.query.code;
        if (!code) {
            return res.status(401).json({
                status: "error",
                message: "Authorization code not provided!",
            });
        }
        const { access_token } = yield (0, session_service_1.getGithubOathToken)({ code });
        const { id, email, avatar_url, login, name, followers, following, bio } = yield (0, session_service_1.getGithubOwnProfile)({
            access_token,
        });
        const accessToken = yield prisma_1.prisma.userSession.upsert({
            where: { userId: id },
            create: { userId: id, accessToken: access_token },
            update: { accessToken: access_token },
        });
        const user = yield prisma_1.prisma.user.upsert({
            where: { username: login },
            create: {
                id,
                username: login,
                name,
                email,
                profilePic: avatar_url,
                bio,
                followers,
                following,
                visitCount: 0,
            },
            update: {
                username: login,
                name,
                email,
                profilePic: avatar_url,
                bio,
                followers,
                following,
            },
        });
        if (!user) {
            const err = new Error("Unauthorized");
            err.statusCode = 401;
        }
        const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN;
        const TOKEN_SECRET = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ sub: user.id }, TOKEN_SECRET, {
            expiresIn: `${TOKEN_EXPIRES_IN}m`,
        });
        res.cookie("token", token, {
            expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 60 * 1000),
            httpOnly: true,
        });
        console.log(token);
        res.status(200).json({
            status: "success",
            data: { id, username: login, name, email, profilePic: avatar_url },
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.githubOauthHandler = githubOauthHandler;

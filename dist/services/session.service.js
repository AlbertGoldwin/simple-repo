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
exports.getGithubOwnProfile = exports.deleteGithubOauthToken = exports.getGithubOathToken = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const GITHUB_OAUTH_CLIENT_ID = process.env
    .GITHUB_OAUTH_CLIENT_ID;
const GITHUB_OAUTH_CLIENT_SECRET = process.env
    .GITHUB_OAUTH_CLIENT_SECRET;
const getGithubOathToken = ({ code, }) => __awaiter(void 0, void 0, void 0, function* () {
    const rootUrl = "https://github.com/login/oauth/access_token";
    const options = {
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: GITHUB_OAUTH_CLIENT_SECRET,
        code,
    };
    const queryString = qs_1.default.stringify(options);
    try {
        const { data } = yield axios_1.default.post(`${rootUrl}?${queryString}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        console.log(data);
        const decoded = qs_1.default.parse(data);
        return decoded;
    }
    catch (err) {
        err.message = err.response.data.message;
        err.statusCode = err.response.status;
        throw err;
    }
});
exports.getGithubOathToken = getGithubOathToken;
const deleteGithubOauthToken = (access_token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.delete(`https://api.github.com/applications/${GITHUB_OAUTH_CLIENT_ID}/token`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            data: {
                access_token,
            },
            auth: {
                username: GITHUB_OAUTH_CLIENT_ID,
                password: GITHUB_OAUTH_CLIENT_SECRET,
            },
        });
        console.log(data);
        const decoded = qs_1.default.parse(data);
        return decoded;
    }
    catch (err) {
        console.log(err);
        err.message = err.response.data.message;
        err.statusCode = err.response.status;
        throw err;
    }
});
exports.deleteGithubOauthToken = deleteGithubOauthToken;
const getGithubOwnProfile = ({ access_token, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return data;
    }
    catch (err) {
        // console.log(err.response);
        err.message = err.response.data.message;
        err.statusCode = err.response.status;
        throw err;
    }
});
exports.getGithubOwnProfile = getGithubOwnProfile;

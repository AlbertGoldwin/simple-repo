"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const session_route_1 = __importDefault(require("./routes/session.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, cookie_parser_1.default)());
if (process.env.NODE_ENV === "development")
    app.use((0, morgan_1.default)("dev"));
app.use("/api/images", express_1.default.static(path_1.default.join(__dirname, "../public")));
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use((0, cors_1.default)({
    credentials: true,
    origin: [FRONTEND_ORIGIN],
}));
app.use("/api/users", user_route_1.default);
app.use("/api/auth", auth_route_1.default);
app.use("/api/sessions", session_route_1.default);
app.get("/api/healthcheck", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Implement OAuth in Node.js",
    });
});
// UnKnown Routes
app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
app.use((err, req, res, next) => {
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
});
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`✅ Server started on port: ${port}`);
    (0, prisma_1.default)();
});

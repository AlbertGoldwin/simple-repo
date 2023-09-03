"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = void 0;
const requireUser = (req, res, next) => {
    try {
        const user = res.locals.user;
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid token or session has expired",
            });
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.requireUser = requireUser;

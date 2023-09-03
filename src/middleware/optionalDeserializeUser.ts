import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

export const optionalDeserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET as unknown as string;
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.sub) },
    });

    if (!user) {
      return next();
    }

    res.locals.user = user;

    next();
  } catch (err: any) {
    next(err);
  }
};

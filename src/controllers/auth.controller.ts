import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  deleteGithubOauthToken,
  getGithubOathToken,
  getGithubOwnProfile,
} from "../services/session.service";
import { prisma } from "../utils/prisma";

export function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser: User = res.locals.user;
    res.cookie("token", "", { maxAge: -1 });
    const userSession = await prisma.userSession.delete({
      where: { userId: currentUser.id },
    });
    await deleteGithubOauthToken(userSession?.accessToken);
    res.status(200).json({ status: "success", message: "User logged out" });
  } catch (err: any) {
    next(err);
  }
};

export const githubOauthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(401).json({
        status: "error",
        message: "Authorization code not provided!",
      });
    }

    const { access_token } = await getGithubOathToken({ code });

    const { id, email, avatar_url, login, name, followers, following, bio } =
      await getGithubOwnProfile({
        access_token,
      });

    const accessToken = await prisma.userSession.upsert({
      where: { userId: id },
      create: { userId: id, accessToken: access_token },
      update: { accessToken: access_token },
    });
    const user = await prisma.user.upsert({
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
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
    }

    const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN as unknown as number;
    const TOKEN_SECRET = process.env.JWT_SECRET as unknown as string;
    const token = jwt.sign({ sub: user.id }, TOKEN_SECRET, {
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
  } catch (err: any) {
    console.log(err);
    next(err);
  }
};

import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { getGithubOwnRepo, getGithubUserRepo } from "../services/repo.service";
import { prisma } from "../utils/prisma";

export const getUserReposHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = req.params.username;
    const query = req.query;
    const size = parseInt(query.size as string);
    if (Number.isNaN(size)) {
      return res.status(400).json({
        status: "error",
        message: "Size query param must be a number!",
      });
    }

    const repos = await getGithubUserRepo(username, size);
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
  } catch (err: any) {
    next(err);
  }
};

export const getOwnReposHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser: User = res.locals.user;
    const query = req.query;
    const size = parseInt(query.size as string);
    if (Number.isNaN(size)) {
      return res.status(400).json({
        status: "error",
        message: "Size query param must be a number!",
      });
    }

    const userSession = await prisma.userSession.findUnique({
      where: { userId: currentUser.id },
    });
    const repos = await getGithubOwnRepo(
      userSession?.accessToken as string,
      size
    );

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
  } catch (err: any) {
    next(err);
  }
};

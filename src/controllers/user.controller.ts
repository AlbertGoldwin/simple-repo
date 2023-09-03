import { NextFunction, Request, Response } from "express";
import { getGithubUserProfile } from "../services/user.service";
import { prisma } from "../utils/prisma";

export const getUserProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = req.params.username;
    const currentUser = res.locals.user;

    const { id, login, name, email, avatar_url, followers, following, bio } =
      await getGithubUserProfile(username);

    if (currentUser && currentUser.username !== username) {
      await prisma.profileVisit.upsert({
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

    const user = await prisma.user.upsert({
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

    const lastVisitors = await prisma.profileVisit.findMany({
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
  } catch (err: any) {
    next(err);
  }
};

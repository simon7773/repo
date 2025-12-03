// 로그인 되었는지 확인 하는 코드
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: Role;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: number;
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

// 관리자 권한 체크 미들웨어
export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "관리자 권한이 필요합니다." });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(500).json({
      error: "권한 확인에 실패했습니다.",
    });
  }
};

// 특정 역할 체크 미들웨어 생성 함수
export const requireRole = (...roles: Role[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true },
      });

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          error: `이 작업은 ${roles.join(", ")} 권한이 필요합니다.`,
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      return res.status(500).json({
        error: "권한 확인에 실패했습니다.",
      });
    }
  };
};

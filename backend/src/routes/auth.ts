import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

const router = express.Router();

interface RegisterBody {
  email: string;
  password: string;
  username: string;
}

interface LoginBody {
  email: string;
  password: string;
}
// 회원가입 api
router.post("/register", async (req, res) => { 
  try {
    const { email, password, username } = req.body as RegisterBody;

    if (!email || !password || !username) {
      return res.status(400).json({
        error: "필수 항목을 모두 채워주십시오.",
      });
    }
// 중복 이메일 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "이미 가입된 email 입니다.",
      });
    }
// 비밀번호 회신
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
// JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "가입에 실패했습니다.",
    });
  }
});
// 로그인 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      return res.status(400).json({
        error: "필수 항목을 모두 채워주십시오.",
      });
    }
// 사용자 찾기
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
// 유저가 없으면
    if (!existingUser) {
      return res.status(400).json({
        error: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }
// 패스워드 확인
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        error: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }

    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        avatar: existingUser.avatar,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "로그인 실패",
    });
  }
});

export default router;

import express from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { prisma } from "../lib/prisma";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const suffix = uuidv4();
    cb(null, suffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."));
    }
  },
});

// 게시글 전체 가져오기
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "게시물 목록을 가져올 수 없습니다.",
    });
  }
});

// 특정 게시글 가져오기
router.get("/:id", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        error: "게시글을 찾을 수 없습니다.",
      });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "게시글을 가져올 수 없습니다.",
    });
  }
});

// 게시글 작성
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req: AuthRequest, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          error: "내용은 필수입니다.",
        });
      }

      const post = await prisma.post.create({
        data: {
          content,
          image: req.file ? `/uploads/${req.file.filename}` : undefined,
          userId: req.userId!,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      res.status(201).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "게시글을 작성할 수 없습니다.",
      });
    }
  }
);

// 게시글 수정
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        error: "존재하지 않는 게시글입니다.",
      });
    }

    if (post.userId !== req.userId) {
      return res.status(403).json({
        error: "수정 권한이 없습니다.",
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "게시글을 수정할 수 없습니다.",
    });
  }
});

// 게시글 삭제
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        error: "존재하지 않는 게시글입니다.",
      });
    }

    if (post.userId !== req.userId) {
      return res.status(403).json({
        error: "삭제 권한이 없습니다.",
      });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({
      message: "게시글이 정상적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "게시글을 삭제할 수 없습니다.",
    });
  }
});

export default router;

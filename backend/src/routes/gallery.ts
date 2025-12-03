import express from "express";
import multer from "multer";
import { ServiceCategory, ImageType } from "@prisma/client";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middlewares/auth";
import { prisma } from "../lib/prisma";
import { supabase } from "../lib/supabase";

const router = express.Router();

// Multer 설정 (메모리 저장)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다 (jpeg, jpg, png, webp)"));
    }
  },
});

// 갤러리 이미지 목록 조회 (공개)
router.get("/", async (req, res) => {
  try {
    const { category, tab, imageType } = req.query;

    const images = await prisma.galleryImage.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as ServiceCategory }),
        ...(tab && { tab: tab as string }),
        ...(imageType && { imageType: imageType as ImageType }),
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "갤러리 이미지를 불러오는데 실패했습니다." });
  }
});

// 갤러리 이미지 업로드 (관리자만)
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "이미지 파일을 업로드해주세요." });
    }

    const { category, tab, imageType, description, order } = req.body;

    if (!category || !tab || !imageType) {
      return res.status(400).json({ error: "필수 항목을 모두 입력해주세요." });
    }

    // 파일명 생성
    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `${category}/${tab}/${imageType}/${fileName}`;

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: "이미지 업로드에 실패했습니다." });
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from("gallery-images")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // DB에 저장
    const image = await prisma.galleryImage.create({
      data: {
        category: category as ServiceCategory,
        tab,
        imageType: imageType as ImageType,
        imageUrl,
        description,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "이미지 업로드에 실패했습니다." });
  }
});

// 갤러리 이미지 수정 (관리자만)
router.put("/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { description, order, isActive } = req.body;

    const image = await prisma.galleryImage.update({
      where: { id: parseInt(id) },
      data: {
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "이미지 수정에 실패했습니다." });
  }
});

// 갤러리 이미지 삭제 (관리자만)
router.delete("/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.galleryImage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!image) {
      return res.status(404).json({ error: "이미지를 찾을 수 없습니다." });
    }

    // Supabase Storage에서 이미지 삭제
    // URL에서 파일 경로 추출
    const url = new URL(image.imageUrl);
    const pathParts = url.pathname.split("/storage/v1/object/public/gallery-images/");
    if (pathParts.length > 1) {
      const filePath = pathParts[1];
      await supabase.storage.from("gallery-images").remove([filePath]);
    }

    // DB에서 삭제
    await prisma.galleryImage.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "이미지가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "이미지 삭제에 실패했습니다." });
  }
});

export default router;

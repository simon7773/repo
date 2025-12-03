import express from "express";
import { OptionCategory, PriceType } from "@prisma/client";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = express.Router();

// 추가 옵션 목록 조회 (모든 사용자)
router.get("/", async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const options = await prisma.additionalOption.findMany({
      where: {
        ...(category && { category: category as OptionCategory }),
        ...(isActive !== undefined && { isActive: isActive === "true" }),
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "옵션 목록을 불러오는데 실패했습니다." });
  }
});

// 특정 옵션 조회
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const option = await prisma.additionalOption.findUnique({
      where: { id: parseInt(id) },
    });

    if (!option) {
      return res.status(404).json({ error: "옵션을 찾을 수 없습니다." });
    }

    res.json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "옵션을 불러오는데 실패했습니다." });
  }
});

// 옵션 생성 (관리자만)
router.post("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, category, priceType, basePrice, unit, description } = req.body;

    if (!name || !category || !priceType || basePrice === undefined) {
      return res.status(400).json({ error: "필수 항목을 모두 채워주세요." });
    }

    const option = await prisma.additionalOption.create({
      data: {
        name,
        category: category as OptionCategory,
        priceType: priceType as PriceType,
        basePrice: parseInt(basePrice),
        unit,
        description,
      },
    });

    res.status(201).json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "옵션 생성에 실패했습니다." });
  }
});

// 옵션 수정 (관리자만)
router.put("/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, category, priceType, basePrice, unit, description, isActive } = req.body;

    const option = await prisma.additionalOption.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(category && { category: category as OptionCategory }),
        ...(priceType && { priceType: priceType as PriceType }),
        ...(basePrice !== undefined && { basePrice: parseInt(basePrice) }),
        ...(unit !== undefined && { unit }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "옵션 수정에 실패했습니다." });
  }
});

// 옵션 삭제 (관리자만)
router.delete("/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.additionalOption.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "옵션이 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "옵션 삭제에 실패했습니다." });
  }
});

export default router;

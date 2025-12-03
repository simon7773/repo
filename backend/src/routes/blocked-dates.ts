import express from "express";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = express.Router();

// 예약 불가 날짜 목록 조회 (모든 사용자)
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    res.json(blockedDates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 불가 날짜를 불러오는데 실패했습니다." });
  }
});

// 예약 불가 날짜 추가 (관리자만)
router.post("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({ error: "날짜를 입력해주세요." });
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: new Date(date),
        reason,
      },
    });

    res.status(201).json(blockedDate);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "이미 등록된 날짜입니다." });
    }
    console.error(error);
    res.status(500).json({ error: "예약 불가 날짜 추가에 실패했습니다." });
  }
});

// 여러 날짜 일괄 추가 (관리자만)
router.post("/bulk", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { dates, reason } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: "날짜 목록을 입력해주세요." });
    }

    const createdDates = [];
    const skippedDates = [];

    for (const date of dates) {
      try {
        const blockedDate = await prisma.blockedDate.create({
          data: {
            date: new Date(date),
            reason,
          },
        });
        createdDates.push(blockedDate);
      } catch (error: any) {
        if (error.code === "P2002") {
          skippedDates.push(date);
        }
      }
    }

    res.status(201).json({
      created: createdDates,
      skipped: skippedDates,
      message: `${createdDates.length}개 추가, ${skippedDates.length}개 건너뜀`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 불가 날짜 일괄 추가에 실패했습니다." });
  }
});

// 예약 불가 날짜 삭제 (관리자만)
router.delete("/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.blockedDate.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "예약 불가 날짜가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 불가 날짜 삭제에 실패했습니다." });
  }
});

// 날짜로 삭제 (관리자만)
router.delete("/date/:date", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { date } = req.params;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    await prisma.blockedDate.deleteMany({
      where: {
        date: targetDate,
      },
    });

    res.json({ message: "예약 불가 날짜가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 불가 날짜 삭제에 실패했습니다." });
  }
});

export default router;

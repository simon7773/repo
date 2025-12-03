import express from "express";
import { BookingStatus } from "@prisma/client";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = express.Router();

// 예약 생성 (로그인한 사용자만 가능)
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      serviceId,
      bookingDate,
      startTime,
      endTime,
      address,
      detailAddress,
      specialRequest,
    } = req.body;

    // 필수 필드 검증
    if (!serviceId || !bookingDate || !startTime || !endTime || !address) {
      return res.status(400).json({ error: "필수 항목을 모두 채워주세요." });
    }

    // 서비스 확인 및 가격 가져오기
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
    });

    if (!service) {
      return res.status(404).json({ error: "서비스를 찾을 수 없습니다." });
    }

    if (!service.isActive) {
      return res.status(400).json({ error: "현재 이용할 수 없는 서비스입니다." });
    }

    // 예약 생성
    const booking = await prisma.booking.create({
      data: {
        customerId: req.userId!,
        serviceId: parseInt(serviceId),
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        address,
        detailAddress,
        specialRequest,
        price: service.price,
        beforeImages: [],
        afterImages: [],
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            address: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 생성에 실패했습니다." });
  }
});

// 내 예약 목록 조회 (로그인한 사용자만 가능)
router.get("/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: req.userId!,
        ...(status && { status: status as BookingStatus }),
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            address: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 목록을 불러오는데 실패했습니다." });
  }
});

// 모든 예약 조회 (관리자만 가능)
router.get("/", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status, serviceId } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        ...(status && { status: status as BookingStatus }),
        ...(serviceId && { serviceId: parseInt(serviceId as string) }),
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            address: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 목록을 불러오는데 실패했습니다." });
  }
});

// 특정 예약 조회
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            address: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
    }

    // 본인의 예약이거나 관리자인 경우만 조회 가능
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (booking.customerId !== req.userId && user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "본인의 예약만 조회할 수 있습니다." });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약을 불러오는데 실패했습니다." });
  }
});

// 예약 수정 (날짜, 시간, 주소 등)
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      bookingDate,
      startTime,
      endTime,
      address,
      detailAddress,
      specialRequest,
    } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
    }

    // 본인의 예약만 수정 가능
    if (booking.customerId !== req.userId) {
      return res
        .status(403)
        .json({ error: "본인의 예약만 수정할 수 있습니다." });
    }

    // 확정된 예약은 수정 불가
    if (booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS") {
      return res
        .status(400)
        .json({ error: "확정되거나 진행 중인 예약은 수정할 수 없습니다." });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        ...(bookingDate && { bookingDate: new Date(bookingDate) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(address && { address }),
        ...(detailAddress !== undefined && { detailAddress }),
        ...(specialRequest !== undefined && { specialRequest }),
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            address: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 수정에 실패했습니다." });
  }
});

// 예약 상태 변경 (관리자만 가능)
router.patch("/:id/status", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, beforeImages, afterImages, completedAt } = req.body;

    if (!status) {
      return res.status(400).json({ error: "상태를 입력해주세요." });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        status: status as BookingStatus,
        ...(beforeImages && { beforeImages }),
        ...(afterImages && { afterImages }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
            address: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 상태 변경에 실패했습니다." });
  }
});

// 예약 취소/삭제
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ error: "예약을 찾을 수 없습니다." });
    }

    // 본인의 예약이거나 관리자만 삭제 가능
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (booking.customerId !== req.userId && user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "본인의 예약만 취소할 수 있습니다." });
    }

    // 진행 중이거나 완료된 예약은 삭제 불가
    if (booking.status === "IN_PROGRESS" || booking.status === "COMPLETED") {
      return res
        .status(400)
        .json({ error: "진행 중이거나 완료된 예약은 취소할 수 없습니다." });
    }

    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "예약이 취소되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "예약 취소에 실패했습니다." });
  }
});

export default router;

import express from "express";
import { PriceType } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { prisma } from "../lib/prisma";

const router = express.Router();

// 견적용 서비스 목록 조회 (가격 정보 포함)
router.get("/services", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        pricePerArea: true,
        minArea: true,
        duration: true,
        category: true,
      },
      orderBy: { category: "asc" },
    });

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서비스 목록을 불러오는데 실패했습니다." });
  }
});

// 추가 옵션 목록 조회
router.get("/options", async (req, res) => {
  try {
    const { category } = req.query;

    const options = await prisma.additionalOption.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as any }),
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "옵션 목록을 불러오는데 실패했습니다." });
  }
});

// 예약 불가능 날짜 조회
router.get("/blocked-dates", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    } else {
      // 기본: 오늘부터 3개월
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      whereClause.date = {
        gte: today,
        lte: threeMonthsLater,
      };
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    res.json(blockedDates);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "예약 불가 날짜를 불러오는데 실패했습니다." });
  }
});

// 특정 날짜의 예약된 시간 조회
router.get("/available-times", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "날짜를 입력해주세요." });
    }

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // 해당 날짜의 예약된 시간 조회
    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: targetDate,
          lt: nextDate,
        },
        status: {
          notIn: ["CANCELLED"],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // 예약된 시간 슬롯 목록
    const bookedSlots = bookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    }));

    // 가능한 시간 슬롯 (09:00 ~ 18:00, 1시간 단위)
    const allSlots = ["08:00", "14:00"];

    const availableSlots = allSlots.filter((slot) => {
      return !bookedSlots.some((booked) => booked.startTime === slot);
    });

    res.json({
      date: targetDate.toISOString().split("T")[0],
      bookedSlots,
      availableSlots,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "예약 가능 시간을 불러오는데 실패했습니다." });
  }
});

// 견적 계산 (실시간)
router.post("/calculate", async (req, res) => {
  try {
    const { serviceId, area, optionIds } = req.body;

    if (!serviceId || !area) {
      return res.status(400).json({ error: "서비스와 면적을 입력해주세요." });
    }

    // 서비스 정보 조회
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
    });

    if (!service) {
      return res.status(404).json({ error: "서비스를 찾을 수 없습니다." });
    }

    // 서비스 가격 계산 (기본가 + 평당 추가금 * 면적)
    const servicePrice =
      service.basePrice + service.pricePerArea * parseInt(area);

    // 추가 옵션 가격 계산
    let optionsPrice = 0;
    const selectedOptions: any[] = [];

    if (optionIds && optionIds.length > 0) {
      const options = await prisma.additionalOption.findMany({
        where: {
          id: { in: optionIds.map((o: any) => parseInt(o.id || o)) },
          isActive: true,
        },
      });

      for (const option of options) {
        const optionInput = optionIds.find(
          (o: any) => parseInt(o.id || o) === option.id
        );
        const quantity = optionInput?.quantity || 1;

        let optionPrice = 0;
        switch (option.priceType) {
          case "FIXED":
            optionPrice = option.basePrice;
            break;
          case "PER_UNIT":
            optionPrice = option.basePrice * quantity;
            break;
          case "PER_AREA":
            optionPrice = option.basePrice * parseInt(area);
            break;
        }

        optionsPrice += optionPrice;
        selectedOptions.push({
          id: option.id,
          name: option.name,
          quantity,
          price: optionPrice,
        });
      }
    }

    const totalPrice = servicePrice + optionsPrice;

    res.json({
      service: {
        id: service.id,
        name: service.name,
        basePrice: service.basePrice,
        pricePerArea: service.pricePerArea,
      },
      area: parseInt(area),
      servicePrice,
      options: selectedOptions,
      optionsPrice,
      totalPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "견적 계산에 실패했습니다." });
  }
});

// 견적 요청 제출 (로그인 필요)
router.post("/submit", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      serviceId,
      area,
      bookingDate,
      startTime,
      endTime,
      address,
      detailAddress,
      specialRequest,
      optionIds,
    } = req.body;

    // 필수 필드 검증
    if (!serviceId || !area || !bookingDate || !startTime || !address) {
      return res.status(400).json({ error: "필수 항목을 모두 채워주세요." });
    }

    // 서비스 확인
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
    });

    if (!service || !service.isActive) {
      return res.status(404).json({ error: "서비스를 찾을 수 없습니다." });
    }

    // 가격 계산
    const servicePrice =
      service.basePrice + service.pricePerArea * parseInt(area);
    let optionsPrice = 0;
    const bookingOptionsData: any[] = [];

    if (optionIds && optionIds.length > 0) {
      const options = await prisma.additionalOption.findMany({
        where: {
          id: { in: optionIds.map((o: any) => parseInt(o.id || o)) },
          isActive: true,
        },
      });

      for (const option of options) {
        const optionInput = optionIds.find(
          (o: any) => parseInt(o.id || o) === option.id
        );
        const quantity = optionInput?.quantity || 1;

        let optionPrice = 0;
        switch (option.priceType) {
          case "FIXED":
            optionPrice = option.basePrice;
            break;
          case "PER_UNIT":
            optionPrice = option.basePrice * quantity;
            break;
          case "PER_AREA":
            optionPrice = option.basePrice * parseInt(area);
            break;
        }

        optionsPrice += optionPrice;
        bookingOptionsData.push({
          optionId: option.id,
          quantity,
          price: optionPrice,
        });
      }
    }

    const totalPrice = servicePrice + optionsPrice;

    // 예약 생성
    const booking = await prisma.booking.create({
      data: {
        customerId: req.userId!,
        serviceId: parseInt(serviceId),
        area: parseInt(area),
        bookingDate: new Date(bookingDate),
        startTime,
        endTime: endTime || calculateEndTime(startTime, service.duration),
        address,
        detailAddress,
        specialRequest,
        price: totalPrice, // deprecated 호환용
        servicePrice,
        optionsPrice,
        totalPrice,
        beforeImages: [],
        afterImages: [],
        options: {
          create: bookingOptionsData,
        },
      },
      include: {
        service: true,
        options: {
          include: {
            option: true,
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "견적 요청에 실패했습니다." });
  }
});

// 종료 시간 계산 헬퍼 함수
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes
    .toString()
    .padStart(2, "0")}`;
}

export default router;

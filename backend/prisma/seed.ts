import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");

  // 1. 관리자 계정 생성
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cleaning.com" },
    update: {},
    create: {
      email: "admin@cleaning.com",
      password: adminPassword,
      username: "관리자",
      role: "ADMIN",
      phone: "010-0000-0000",
    },
  });
  console.log("✅ 관리자 계정 생성:", admin.email);

  // 2. 테스트 고객 계정 생성
  const customerPassword = await bcrypt.hash("test1234", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      password: customerPassword,
      username: "테스트고객",
      role: "CUSTOMER",
      phone: "010-1111-1111",
      address: "서울시 강남구 테헤란로 123",
    },
  });
  console.log("✅ 테스트 고객 계정 생성:", customer.email);

  // 3. 청소 서비스 생성
  const services = [
    {
      name: "가정 청소",
      description:
        "일반 가정집 청소 서비스입니다. 거실, 침실, 주방, 화장실 등 전체 공간을 깨끗하게 청소합니다.",
      price: 50000,
      duration: 120,
      category: "HOME" as const,
    },
    {
      name: "사무실 청소",
      description:
        "사무실 및 상업 공간 청소 서비스입니다. 책상, 회의실, 공용 공간을 깔끔하게 정리합니다.",
      price: 80000,
      duration: 180,
      category: "OFFICE" as const,
    },
    {
      name: "이사 청소",
      description:
        "이사 전후 청소 서비스입니다. 입주 전 깨끗한 공간을 준비하거나 퇴거 전 원상복구를 도와드립니다.",
      price: 150000,
      duration: 240,
      category: "MOVE" as const,
    },
    {
      name: "특수 청소",
      description:
        "수영장, 외벽, 대형 시설 등 특수 청소가 필요한 공간을 전문적으로 관리합니다.",
      price: 200000,
      duration: 300,
      category: "SPECIAL" as const,
    },
  ];

  for (const serviceData of services) {
    const service = await prisma.service.upsert({
      where: {
        // name을 unique key로 사용하기 위해 임시로 id를 사용
        id: services.indexOf(serviceData) + 1,
      },
      update: serviceData,
      create: serviceData,
    });
    console.log(`✅ 서비스 생성: ${service.name} (${service.price}원)`);
  }

  console.log("\n🎉 시드 데이터 생성 완료!");
  console.log("\n📋 생성된 계정 정보:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("관리자 계정:");
  console.log("  Email: admin@cleaning.com");
  console.log("  Password: admin1234");
  console.log("");
  console.log("테스트 고객 계정:");
  console.log("  Email: customer@test.com");
  console.log("  Password: test1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ 시드 데이터 생성 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

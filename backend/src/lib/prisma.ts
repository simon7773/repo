import { PrismaClient } from "@prisma/client";

// PrismaClient 싱글톤 인스턴스
// 개발 환경에서 Hot Reload 시 연결 풀 고갈을 방지하기 위한 전역 변수 사용
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

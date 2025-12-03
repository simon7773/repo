-- CreateEnum
CREATE TYPE "OptionCategory" AS ENUM ('CLEANING', 'APPLIANCE', 'SPECIAL');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'PER_UNIT', 'PER_AREA');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "area" INTEGER,
ADD COLUMN     "optionsPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "servicePrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPrice" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "basePrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minArea" INTEGER,
ADD COLUMN     "pricePerArea" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AdditionalOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "OptionCategory" NOT NULL,
    "priceType" "PriceType" NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdditionalOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingOption" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingOption_bookingId_optionId_key" ON "BookingOption"("bookingId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_date_key" ON "BlockedDate"("date");

-- AddForeignKey
ALTER TABLE "BookingOption" ADD CONSTRAINT "BookingOption_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingOption" ADD CONSTRAINT "BookingOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "AdditionalOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

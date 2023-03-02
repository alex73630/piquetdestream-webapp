-- CreateEnum
CREATE TYPE "StreamRequestTimeslotStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "TechAppointmentStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('MODERATOR', 'MEDIATION', 'STREAMER', 'TECH');

-- CreateTable
CREATE TABLE "StreamRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "guests" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "techAppointmentId" INTEGER,

    CONSTRAINT "StreamRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamRequestTimeSlots" (
    "id" SERIAL NOT NULL,
    "streamRequestId" INTEGER NOT NULL,
    "status" "StreamRequestTimeslotStatus" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamRequestTimeSlots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechAppointment" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "status" "TechAppointmentStatus" NOT NULL,
    "techId" TEXT NOT NULL,

    CONSTRAINT "TechAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "AvailabilityType" NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StreamRequest_techAppointmentId_key" ON "StreamRequest"("techAppointmentId");

-- AddForeignKey
ALTER TABLE "StreamRequest" ADD CONSTRAINT "StreamRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamRequest" ADD CONSTRAINT "StreamRequest_techAppointmentId_fkey" FOREIGN KEY ("techAppointmentId") REFERENCES "TechAppointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamRequestTimeSlots" ADD CONSTRAINT "StreamRequestTimeSlots_streamRequestId_fkey" FOREIGN KEY ("streamRequestId") REFERENCES "StreamRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechAppointment" ADD CONSTRAINT "TechAppointment_techId_fkey" FOREIGN KEY ("techId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

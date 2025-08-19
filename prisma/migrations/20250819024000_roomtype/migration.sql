-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'SUITE');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'SINGLE';

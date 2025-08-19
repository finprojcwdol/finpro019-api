/*
  Warnings:

  - Added the required column `number_of_rooms` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PropertyCategory" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "number_of_rooms" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RoomFacilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RoomFacilities_pkey" PRIMARY KEY ("id")
);

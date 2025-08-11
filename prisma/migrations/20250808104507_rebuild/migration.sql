/*
  Warnings:

  - You are about to drop the column `phonde_number` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "phonde_number",
ADD COLUMN     "phone_number" TEXT;

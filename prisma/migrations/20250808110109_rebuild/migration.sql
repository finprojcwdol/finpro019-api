/*
  Warnings:

  - You are about to drop the column `pic_phone_Numbde` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "pic_phone_Numbde",
ADD COLUMN     "pic_phone_number" TEXT;

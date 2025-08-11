-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "country" TEXT,
ADD COLUMN     "phonde_number" TEXT,
ADD COLUMN     "phone_country" TEXT,
ADD COLUMN     "pic_country_code" TEXT,
ADD COLUMN     "pic_email" TEXT,
ADD COLUMN     "pic_first_name" TEXT,
ADD COLUMN     "pic_last_name" TEXT,
ADD COLUMN     "pic_phone_Numbde" TEXT,
ADD COLUMN     "pic_position" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "long" DROP NOT NULL,
ALTER COLUMN "lot" DROP NOT NULL;

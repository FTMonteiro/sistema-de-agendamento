-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "closingTime" TEXT,
ADD COLUMN     "openingTime" TEXT,
ADD COLUMN     "rules" TEXT,
ADD COLUMN     "slotInterval" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "workingDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6]::INTEGER[];

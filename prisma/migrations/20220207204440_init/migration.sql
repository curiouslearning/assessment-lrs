-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "city" TEXT,
ADD COLUMN     "continent" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "referralId" TEXT,
ADD COLUMN     "region" TEXT;

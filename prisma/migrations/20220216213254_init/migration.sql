/*
  Warnings:

  - You are about to drop the `AgentAccount` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[homepage,name,mbox,mbox_sha1sum,openid]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.
  - Made the column `objectType` on table `AgentProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AgentAccount" DROP CONSTRAINT "AgentAccount_agentId_fkey";

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "homepage" TEXT,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "stored" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "objectType" SET NOT NULL,
ALTER COLUMN "objectType" SET DEFAULT E'Agent',
ALTER COLUMN "lat" SET DATA TYPE TEXT,
ALTER COLUMN "lng" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "AgentAccount";

-- CreateIndex
CREATE UNIQUE INDEX "Agent_homepage_name_mbox_mbox_sha1sum_openid_key" ON "Agent"("homepage", "name", "mbox", "mbox_sha1sum", "openid");

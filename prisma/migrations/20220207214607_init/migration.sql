/*
  Warnings:

  - The primary key for the `AgentProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AgentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mbox` on the `AgentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mbox_sha1sum` on the `AgentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `openid` on the `AgentProfile` table. All the data in the column will be lost.
  - Added the required column `agentId` to the `AgentProfile` table without a default value. This is not possible if the table is not empty.
  - The required column `profileId` was added to the `AgentProfile` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "AgentAccount" DROP CONSTRAINT "AgentAccount_agentId_fkey";

-- AlterTable
ALTER TABLE "AgentProfile" DROP CONSTRAINT "AgentProfile_pkey",
DROP COLUMN "id",
DROP COLUMN "mbox",
DROP COLUMN "mbox_sha1sum",
DROP COLUMN "openid",
ADD COLUMN     "agentId" TEXT NOT NULL,
ADD COLUMN     "profileId" TEXT NOT NULL,
ADD CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("profileId");

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "mbox" TEXT,
    "mbox_sha1sum" TEXT,
    "openid" TEXT,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAccount" ADD CONSTRAINT "AgentAccount_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

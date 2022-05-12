/*
  Warnings:

  - You are about to drop the column `languages` on the `AgentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "agentName" TEXT;

-- AlterTable
ALTER TABLE "AgentProfile" DROP COLUMN "languages",
ADD COLUMN     "language" TEXT;

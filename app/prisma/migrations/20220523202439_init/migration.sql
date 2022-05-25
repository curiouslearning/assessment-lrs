/*
  Warnings:

  - Added the required column `extendedProfile` to the `AgentProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "extendedProfile" JSONB NOT NULL;

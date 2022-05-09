/*
  Warnings:

  - Made the column `name` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mbox` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mbox_sha1sum` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `openid` on table `Agent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `homePage` on table `Agent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "mbox" SET NOT NULL,
ALTER COLUMN "mbox_sha1sum" SET NOT NULL,
ALTER COLUMN "openid" SET NOT NULL,
ALTER COLUMN "homePage" SET NOT NULL;

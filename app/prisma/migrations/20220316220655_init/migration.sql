/*
  Warnings:

  - You are about to drop the column `homepage` on the `Agent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[homePage,name,mbox,mbox_sha1sum,openid]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Agent_homepage_name_mbox_mbox_sha1sum_openid_key";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "homepage",
ADD COLUMN     "homePage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Agent_homePage_name_mbox_mbox_sha1sum_openid_key" ON "Agent"("homePage", "name", "mbox", "mbox_sha1sum", "openid");

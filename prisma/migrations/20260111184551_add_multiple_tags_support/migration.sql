/*
  Warnings:

  - You are about to drop the column `tagId` on the `Profile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_tagId_fkey";

-- DropIndex
DROP INDEX "Like_postId_userId_idx";

-- DropIndex
DROP INDEX "Notification_recipientId_read_createdAt_idx";

-- DropIndex
DROP INDEX "Profile_tagId_idx";

-- DropIndex
DROP INDEX "Repost_postId_userId_idx";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "tagId";

-- CreateTable
CREATE TABLE "ProfileTag" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileTag_profileId_idx" ON "ProfileTag"("profileId");

-- CreateIndex
CREATE INDEX "ProfileTag_tagId_idx" ON "ProfileTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileTag_profileId_tagId_key" ON "ProfileTag"("profileId", "tagId");

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

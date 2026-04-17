/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,userId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ChatMemberRole" ADD VALUE 'OWNER';

-- CreateIndex
CREATE UNIQUE INDEX "Contact_ownerId_userId_key" ON "Contact"("ownerId", "userId");

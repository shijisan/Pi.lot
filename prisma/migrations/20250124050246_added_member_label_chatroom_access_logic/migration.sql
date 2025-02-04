/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `maxMembers` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ChatroomAccess` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "createdAt",
DROP COLUMN "isPrivate",
DROP COLUMN "maxMembers";

-- AlterTable
ALTER TABLE "ChatroomAccess" DROP COLUMN "createdAt",
ALTER COLUMN "canWrite" SET DEFAULT false;

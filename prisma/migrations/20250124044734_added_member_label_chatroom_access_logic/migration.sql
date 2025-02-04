/*
  Warnings:

  - You are about to drop the column `label` on the `UserLabel` table. All the data in the column will be lost.
  - Added the required column `name` to the `UserLabel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `UserLabel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chatroom" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxMembers" INTEGER;

-- AlterTable
ALTER TABLE "ChatroomAccess" ADD COLUMN     "canRead" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canWrite" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserLabel" DROP COLUMN "label",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organizationId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "UserLabel" ADD CONSTRAINT "UserLabel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

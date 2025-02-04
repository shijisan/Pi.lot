/*
  Warnings:

  - You are about to drop the column `labelId` on the `OrganizationUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrganizationUser" DROP CONSTRAINT "OrganizationUser_labelId_fkey";

-- AlterTable
ALTER TABLE "OrganizationUser" DROP COLUMN "labelId",
ADD COLUMN     "userLabelId" UUID;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_userLabelId_fkey" FOREIGN KEY ("userLabelId") REFERENCES "UserLabel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

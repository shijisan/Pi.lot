-- CreateTable
CREATE TABLE "ChatroomAccess" (
    "id" UUID NOT NULL,
    "chatroomId" UUID NOT NULL,
    "labelId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatroomAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomAccess_chatroomId_labelId_key" ON "ChatroomAccess"("chatroomId", "labelId");

-- AddForeignKey
ALTER TABLE "ChatroomAccess" ADD CONSTRAINT "ChatroomAccess_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomAccess" ADD CONSTRAINT "ChatroomAccess_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "UserLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

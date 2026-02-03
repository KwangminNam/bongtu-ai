-- CreateTable
CREATE TABLE "SentRecord" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "memo" TEXT,
    "friendId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentRecord_friendId_idx" ON "SentRecord"("friendId");

-- CreateIndex
CREATE INDEX "SentRecord_userId_idx" ON "SentRecord"("userId");

-- AddForeignKey
ALTER TABLE "SentRecord" ADD CONSTRAINT "SentRecord_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentRecord" ADD CONSTRAINT "SentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

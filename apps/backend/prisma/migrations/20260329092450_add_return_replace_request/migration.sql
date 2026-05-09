-- CreateTable
CREATE TABLE "ReturnReplaceRequest" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReturnReplaceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReturnReplaceRequest_orderId_idx" ON "ReturnReplaceRequest"("orderId");

-- CreateIndex
CREATE INDEX "ReturnReplaceRequest_userId_idx" ON "ReturnReplaceRequest"("userId");

-- AddForeignKey
ALTER TABLE "ReturnReplaceRequest" ADD CONSTRAINT "ReturnReplaceRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnReplaceRequest" ADD CONSTRAINT "ReturnReplaceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "ages" TEXT,
ADD COLUMN     "bring" TEXT,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "waitlisted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Registration_activityId_waitlisted_createdAt_idx" ON "Registration"("activityId", "waitlisted", "createdAt");

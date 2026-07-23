-- CreateEnum
CREATE TYPE "Seat" AS ENUM ('USER_ONE', 'USER_TWO');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('SOUND', 'MUSIC');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentifier" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "AuthIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatCredential" (
    "id" TEXT NOT NULL,
    "seat" "Seat" NOT NULL,
    "pinHash" TEXT NOT NULL,
    "failedPinAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,

    CONSTRAINT "SeatCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tag" TEXT,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "ownerSeat" "Seat" NOT NULL,
    "lastSavedAt" TIMESTAMP(3),
    "unlockedForOwnerEdit" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAttachment" (
    "id" TEXT NOT NULL,
    "keyword" TEXT,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "label" TEXT,
    "entryId" TEXT NOT NULL,

    CONSTRAINT "MediaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentifier_identifier_key" ON "AuthIdentifier"("identifier");

-- CreateIndex
CREATE INDEX "AuthIdentifier_accountId_idx" ON "AuthIdentifier"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatCredential_accountId_seat_key" ON "SeatCredential"("accountId", "seat");

-- CreateIndex
CREATE INDEX "Entry_accountId_idx" ON "Entry"("accountId");

-- CreateIndex
CREATE INDEX "MediaAttachment_entryId_idx" ON "MediaAttachment"("entryId");

-- AddForeignKey
ALTER TABLE "AuthIdentifier" ADD CONSTRAINT "AuthIdentifier_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatCredential" ADD CONSTRAINT "SeatCredential_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

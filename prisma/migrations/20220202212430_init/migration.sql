-- CreateEnum
CREATE TYPE "ObjectType" AS ENUM ('Agent', 'Group', 'Activity', 'StatementRef', 'SubStatement');

-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorType" "ObjectType",
    "verbId" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "objectType" "ObjectType",
    "timestamp" TIMESTAMP(3),
    "stored" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL DEFAULT E'1.0.0',
    "statement" JSONB NOT NULL,
    "attachments" JSONB,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL,
    "objectType" "ObjectType",
    "mbox" TEXT,
    "mbox_sha1sum" TEXT,
    "openid" TEXT,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAccount" (
    "agentId" TEXT NOT NULL,
    "homePage" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AgentAccount_pkey" PRIMARY KEY ("homePage","name")
);

-- CreateTable
CREATE TABLE "ActivityProfile" (
    "objectType" "ObjectType",
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "type" TEXT,
    "interactionType" TEXT,
    "correctResponsesPattern" TEXT[],
    "choices" TEXT[],
    "scale" TEXT[],
    "source" TEXT[],
    "target" TEXT[],
    "steps" TEXT[],
    "moreinfo" TEXT,
    "extensions" JSONB NOT NULL,

    CONSTRAINT "ActivityProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Statement_id_key" ON "Statement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AgentAccount_agentId_key" ON "AgentAccount"("agentId");

-- AddForeignKey
ALTER TABLE "AgentAccount" ADD CONSTRAINT "AgentAccount_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

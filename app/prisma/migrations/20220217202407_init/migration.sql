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
    "profileId" TEXT NOT NULL,
    "objectType" "ObjectType" NOT NULL DEFAULT E'Agent',
    "agentId" TEXT NOT NULL,
    "continent" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "lat" TEXT,
    "lng" TEXT,
    "referralId" TEXT,
    "languages" TEXT[],
    "stored" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "homepage" TEXT,
    "name" TEXT,
    "mbox" TEXT,
    "mbox_sha1sum" TEXT,
    "openid" TEXT,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Agent_homepage_name_mbox_mbox_sha1sum_openid_key" ON "Agent"("homepage", "name", "mbox", "mbox_sha1sum", "openid");

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

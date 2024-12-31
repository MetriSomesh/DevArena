-- CreateTable
CREATE TABLE "UserGameInfo" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "stack" TEXT[],

    CONSTRAINT "UserGameInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGameInfo_userid_key" ON "UserGameInfo"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "UserGameInfo_username_key" ON "UserGameInfo"("username");

-- AddForeignKey
ALTER TABLE "UserGameInfo" ADD CONSTRAINT "UserGameInfo_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

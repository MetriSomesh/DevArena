-- AlterTable
ALTER TABLE "UserGameInfo" ADD COLUMN     "rank" TEXT NOT NULL DEFAULT 'plastic',
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

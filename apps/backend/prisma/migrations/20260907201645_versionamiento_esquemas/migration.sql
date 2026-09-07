-- AlterTable
ALTER TABLE "Esquema" ADD COLUMN     "esquemaVersionDeId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Esquema" ADD CONSTRAINT "Esquema_esquemaVersionDeId_fkey" FOREIGN KEY ("esquemaVersionDeId") REFERENCES "Esquema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

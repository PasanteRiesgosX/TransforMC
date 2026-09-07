-- AlterTable
ALTER TABLE "Esquema" ADD COLUMN     "esquemaPadreId" TEXT;

-- AddForeignKey
ALTER TABLE "Esquema" ADD CONSTRAINT "Esquema_esquemaPadreId_fkey" FOREIGN KEY ("esquemaPadreId") REFERENCES "Esquema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

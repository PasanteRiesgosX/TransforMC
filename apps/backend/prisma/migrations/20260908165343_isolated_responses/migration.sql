/*
  Warnings:

  - A unique constraint covering the columns `[paqueteItemId,certificadoPorId]` on the table `ResultadoItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ResultadoItem_paqueteItemId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoItem_paqueteItemId_certificadoPorId_key" ON "ResultadoItem"("paqueteItemId", "certificadoPorId");

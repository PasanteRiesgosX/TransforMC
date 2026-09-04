/*
  Warnings:

  - You are about to drop the column `comentario` on the `ResultadoItem` table. All the data in the column will be lost.
  - You are about to drop the column `evidencia` on the `ResultadoItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ResultadoItem" DROP COLUMN "comentario",
DROP COLUMN "evidencia",
ADD COLUMN     "comentarioCambio" TEXT,
ADD COLUMN     "comentarioFalla" TEXT,
ALTER COLUMN "cambio" DROP NOT NULL,
ALTER COLUMN "cambio" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ResultadoItem" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ResultadoHistorico" (
    "id" TEXT NOT NULL,
    "paqueteItemId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "cambio" BOOLEAN,
    "comentarioFalla" TEXT,
    "comentarioCambio" TEXT,
    "certificadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL,
    "certificadoEn" TIMESTAMP(3),
    "archivadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultadoHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResultadoHistorico_paqueteItemId_idx" ON "ResultadoHistorico"("paqueteItemId");

-- AddForeignKey
ALTER TABLE "ResultadoHistorico" ADD CONSTRAINT "ResultadoHistorico_paqueteItemId_fkey" FOREIGN KEY ("paqueteItemId") REFERENCES "PaqueteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoHistorico" ADD CONSTRAINT "ResultadoHistorico_certificadoPorId_fkey" FOREIGN KEY ("certificadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

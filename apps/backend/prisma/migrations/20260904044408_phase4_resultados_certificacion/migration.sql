-- CreateTable
CREATE TABLE "ResultadoItem" (
    "id" TEXT NOT NULL,
    "paqueteItemId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "evidencia" TEXT,
    "comentario" TEXT,
    "certificadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "certificadoEn" TIMESTAMP(3),

    CONSTRAINT "ResultadoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoItem_paqueteItemId_key" ON "ResultadoItem"("paqueteItemId");

-- CreateIndex
CREATE INDEX "ResultadoItem_estado_idx" ON "ResultadoItem"("estado");

-- CreateIndex
CREATE INDEX "ResultadoItem_certificadoPorId_idx" ON "ResultadoItem"("certificadoPorId");

-- AddForeignKey
ALTER TABLE "ResultadoItem" ADD CONSTRAINT "ResultadoItem_paqueteItemId_fkey" FOREIGN KEY ("paqueteItemId") REFERENCES "PaqueteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoItem" ADD CONSTRAINT "ResultadoItem_certificadoPorId_fkey" FOREIGN KEY ("certificadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

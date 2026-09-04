-- CreateTable
CREATE TABLE "EnvioCertificacion" (
    "id" TEXT NOT NULL,
    "esquemaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "enviadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvioCertificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnvioCertificacion_usuarioId_idx" ON "EnvioCertificacion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "EnvioCertificacion_esquemaId_usuarioId_key" ON "EnvioCertificacion"("esquemaId", "usuarioId");

-- AddForeignKey
ALTER TABLE "EnvioCertificacion" ADD CONSTRAINT "EnvioCertificacion_esquemaId_fkey" FOREIGN KEY ("esquemaId") REFERENCES "Esquema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioCertificacion" ADD CONSTRAINT "EnvioCertificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

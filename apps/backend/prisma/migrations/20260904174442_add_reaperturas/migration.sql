-- CreateTable
CREATE TABLE "SolicitudReapertura" (
    "id" TEXT NOT NULL,
    "esquemaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDING',
    "motivo" TEXT NOT NULL,
    "respuestaAdmin" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudReapertura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SolicitudReapertura" ADD CONSTRAINT "SolicitudReapertura_esquemaId_fkey" FOREIGN KEY ("esquemaId") REFERENCES "Esquema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudReapertura" ADD CONSTRAINT "SolicitudReapertura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

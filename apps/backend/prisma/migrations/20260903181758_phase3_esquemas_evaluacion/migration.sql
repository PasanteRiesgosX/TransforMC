-- CreateTable
CREATE TABLE "Esquema" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Esquema sin nombre',
    "ambiente" TEXT NOT NULL DEFAULT 'Pruebas',
    "creadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Esquema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paquete" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esquemaId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paquete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaqueteItem" (
    "id" TEXT NOT NULL,
    "paqueteId" TEXT NOT NULL,
    "casoPruebaId" TEXT NOT NULL,
    "esquemaId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaqueteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaqueteResponsable" (
    "paqueteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaqueteResponsable_pkey" PRIMARY KEY ("paqueteId","usuarioId")
);

-- CreateIndex
CREATE INDEX "Esquema_creadoEn_idx" ON "Esquema"("creadoEn");

-- CreateIndex
CREATE INDEX "Paquete_esquemaId_orden_idx" ON "Paquete"("esquemaId", "orden");

-- CreateIndex
CREATE INDEX "PaqueteItem_paqueteId_idx" ON "PaqueteItem"("paqueteId");

-- CreateIndex
CREATE INDEX "PaqueteItem_casoPruebaId_idx" ON "PaqueteItem"("casoPruebaId");

-- CreateIndex
CREATE UNIQUE INDEX "PaqueteItem_esquemaId_casoPruebaId_key" ON "PaqueteItem"("esquemaId", "casoPruebaId");

-- CreateIndex
CREATE INDEX "PaqueteResponsable_usuarioId_idx" ON "PaqueteResponsable"("usuarioId");

-- AddForeignKey
ALTER TABLE "Esquema" ADD CONSTRAINT "Esquema_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paquete" ADD CONSTRAINT "Paquete_esquemaId_fkey" FOREIGN KEY ("esquemaId") REFERENCES "Esquema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteItem" ADD CONSTRAINT "PaqueteItem_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "Paquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteItem" ADD CONSTRAINT "PaqueteItem_casoPruebaId_fkey" FOREIGN KEY ("casoPruebaId") REFERENCES "CasoPrueba"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteItem" ADD CONSTRAINT "PaqueteItem_esquemaId_fkey" FOREIGN KEY ("esquemaId") REFERENCES "Esquema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteResponsable" ADD CONSTRAINT "PaqueteResponsable_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "Paquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaqueteResponsable" ADD CONSTRAINT "PaqueteResponsable_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

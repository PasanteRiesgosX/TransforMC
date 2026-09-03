-- CreateTable
CREATE TABLE "Modulo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "version" TEXT,
    "conjunto" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubModulo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "moduloId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clasificador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "subModuloId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clasificador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasoPrueba" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "subModuloId" TEXT NOT NULL,
    "clasificadorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasoPrueba_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Modulo_nombre_key" ON "Modulo"("nombre");

-- CreateIndex
CREATE INDEX "Modulo_orden_idx" ON "Modulo"("orden");

-- CreateIndex
CREATE INDEX "SubModulo_moduloId_orden_idx" ON "SubModulo"("moduloId", "orden");

-- CreateIndex
CREATE INDEX "Clasificador_subModuloId_orden_idx" ON "Clasificador"("subModuloId", "orden");

-- CreateIndex
CREATE INDEX "CasoPrueba_subModuloId_orden_idx" ON "CasoPrueba"("subModuloId", "orden");

-- CreateIndex
CREATE INDEX "CasoPrueba_clasificadorId_idx" ON "CasoPrueba"("clasificadorId");

-- AddForeignKey
ALTER TABLE "Modulo" ADD CONSTRAINT "Modulo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubModulo" ADD CONSTRAINT "SubModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clasificador" ADD CONSTRAINT "Clasificador_subModuloId_fkey" FOREIGN KEY ("subModuloId") REFERENCES "SubModulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasoPrueba" ADD CONSTRAINT "CasoPrueba_subModuloId_fkey" FOREIGN KEY ("subModuloId") REFERENCES "SubModulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasoPrueba" ADD CONSTRAINT "CasoPrueba_clasificadorId_fkey" FOREIGN KEY ("clasificadorId") REFERENCES "Clasificador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

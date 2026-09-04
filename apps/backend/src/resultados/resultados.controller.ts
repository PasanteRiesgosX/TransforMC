import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ResultadosService } from './resultados.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Roles as SharedRoles } from '@vista/shared';

/**
 * FASE 4 — RESULTADOS (solo lectura).
 *
 * Cuatro endpoints, uno por nivel del drill-down. Cada uno devuelve su vista YA
 * AGREGADA: la UI no recorre listas de ítems crudos para calcular porcentajes.
 * Aquí no se escribe nada: la escritura de ResultadoItem vive en la Fase 5.
 */
@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SharedRoles.ADMIN)
export class ResultadosController {
  constructor(private readonly resultadosService: ResultadosService) {}

  /** Nivel 0 — KPIs acumulados + una tarjeta por esquema. */
  @Get('resultados/overview')
  overview() {
    return this.resultadosService.overview();
  }

  /** Nivel 1 — módulos que participan en el esquema. */
  @Get('resultados/esquemas/:esquemaId')
  porEsquema(@Param('esquemaId') esquemaId: string) {
    return this.resultadosService.porEsquema(esquemaId);
  }

  /** Nivel 2 — submódulos de ese módulo dentro del esquema. */
  @Get('resultados/esquemas/:esquemaId/modulos/:moduloId')
  porModulo(
    @Param('esquemaId') esquemaId: string,
    @Param('moduloId') moduloId: string,
  ) {
    return this.resultadosService.porModulo(esquemaId, moduloId);
  }

  /** Nivel 3 — casos de prueba seleccionados en ese submódulo (la tabla). */
  @Get('resultados/esquemas/:esquemaId/submodulos/:subModuloId')
  porSubModulo(
    @Param('esquemaId') esquemaId: string,
    @Param('subModuloId') subModuloId: string,
  ) {
    return this.resultadosService.porSubModulo(esquemaId, subModuloId);
  }
}

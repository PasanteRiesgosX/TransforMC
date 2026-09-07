import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Roles as SharedRoles } from '@vista/shared';

@Controller('api/solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SharedRoles.ADMIN)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get()
  listarEsquemasConSolicitudes() {
    return this.solicitudesService.listarEsquemasConSolicitudes();
  }

  @Get(':esquemaId')
  listarPorEsquema(@Param('esquemaId') esquemaId: string) {
    return this.solicitudesService.listarPorEsquema(esquemaId);
  }

  @Patch(':id/aceptar')
  aceptar(@Param('id') id: string) {
    return this.solicitudesService.aceptar(id);
  }

  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string, @Body('respuestaAdmin') respuestaAdmin: string) {
    return this.solicitudesService.rechazar(id, respuestaAdmin);
  }
}

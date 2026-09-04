import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CertificacionesService } from './certificaciones.service';
import { ActualizarRespuestaDto } from './dto/certificaciones.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles as SharedRoles } from '@vista/shared';

/**
 * FASE 5 — MIS CERTIFICACIONES (rol CERTIFIER).
 *
 * Todo se resuelve contra el usuario del token: el certificador solo puede ver y
 * escribir los casos de prueba de los paquetes donde el admin lo puso como
 * responsable. El `esquemaId` / `moduloId` de la URL acota, nunca amplía.
 */
@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SharedRoles.CERTIFIER)
export class CertificacionesController {
  constructor(private readonly certificacionesService: CertificacionesService) {}

  /** Nivel 0 — esquemas donde tengo algo asignado. */
  @Get('mis-certificaciones')
  misEsquemas(@CurrentUser() user: any) {
    return this.certificacionesService.misEsquemas(user.userId);
  }

  /** Nivel 1 — módulos (con sus submódulos) que me tocan en ese esquema. */
  @Get('mis-certificaciones/:esquemaId')
  misModulos(@CurrentUser() user: any, @Param('esquemaId') esquemaId: string) {
    return this.certificacionesService.misModulos(user.userId, esquemaId);
  }

  /** Nivel 2 — casos de prueba del módulo, agrupados por submódulo. */
  @Get('mis-certificaciones/:esquemaId/modulos/:moduloId')
  misCasos(
    @CurrentUser() user: any,
    @Param('esquemaId') esquemaId: string,
    @Param('moduloId') moduloId: string,
  ) {
    return this.certificacionesService.misCasos(user.userId, esquemaId, moduloId);
  }

  /**
   * Cierra el esquema para este certificador. Irreversible en la Fase 5: la
   * reapertura es la Fase 6.
   */
  @Post('mis-certificaciones/:esquemaId/enviar')
  enviar(@CurrentUser() user: any, @Param('esquemaId') esquemaId: string) {
    return this.certificacionesService.enviarCertificacion(user.userId, esquemaId);
  }

  /** Autoguardado de la respuesta de un caso de prueba. */
  @Patch('mis-certificaciones/items/:paqueteItemId')
  guardarRespuesta(
    @CurrentUser() user: any,
    @Param('paqueteItemId') paqueteItemId: string,
    @Body() dto: ActualizarRespuestaDto,
  ) {
    return this.certificacionesService.guardarRespuesta(user.userId, paqueteItemId, dto);
  }
}

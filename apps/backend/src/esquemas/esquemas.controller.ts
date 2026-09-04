import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EsquemasService } from './esquemas.service';
import {
  CreateEsquemaDto,
  UpdateEsquemaDto,
  CreatePaqueteDto,
  UpdatePaqueteDto,
} from './dto/esquemas.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles as SharedRoles } from '@vista/shared';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SharedRoles.ADMIN)
export class EsquemasController {
  constructor(private readonly esquemasService: EsquemasService) {}

  // ---------------- ESQUEMAS ----------------

  @Get('esquemas')
  findAll() {
    return this.esquemasService.findAll();
  }

  @Get('esquemas/:id')
  findOne(@Param('id') id: string) {
    return this.esquemasService.findOne(id);
  }

  @Post('esquemas')
  crear(@Body() dto: CreateEsquemaDto, @CurrentUser() user: any) {
    return this.esquemasService.crear(dto, user?.userId);
  }

  @Patch('esquemas/:id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateEsquemaDto) {
    return this.esquemasService.actualizar(id, dto);
  }

  @Delete('esquemas/:id')
  eliminar(@Param('id') id: string) {
    return this.esquemasService.eliminar(id);
  }

  // ---------------- PAQUETES ----------------

  @Post('esquemas/:id/paquetes')
  agregarPaquete(@Param('id') id: string, @Body() dto: CreatePaqueteDto) {
    return this.esquemasService.agregarPaquete(id, dto);
  }

  @Patch('paquetes/:id')
  actualizarPaquete(@Param('id') id: string, @Body() dto: UpdatePaqueteDto) {
    return this.esquemasService.actualizarPaquete(id, dto);
  }

  @Delete('paquetes/:id')
  eliminarPaquete(@Param('id') id: string) {
    return this.esquemasService.eliminarPaquete(id);
  }
}

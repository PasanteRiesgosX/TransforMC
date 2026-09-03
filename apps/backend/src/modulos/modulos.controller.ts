import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ModulosService } from './modulos.service';
import { 
  CreateModuloDto, UpdateModuloDto, 
  CreateSubModuloDto, UpdateSubModuloDto,
  CreateClasificadorDto, UpdateClasificadorDto,
  CreateCasoPruebaDto, UpdateCasoPruebaDto 
} from './dto/modulos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  // ==========================================
  // MODULOS
  // ==========================================

  @Get('modulos')
  findAllModulos() {
    return this.modulosService.findAllModulos();
  }

  @Get('modulos/:id')
  findModuloById(@Param('id') id: string) {
    return this.modulosService.findModuloById(id);
  }

  @Post('modulos')
  createModulo(@Body() createModuloDto: CreateModuloDto, @CurrentUser() user: any) {
    return this.modulosService.createModulo(createModuloDto, user?.userId);
  }

  @Patch('modulos/:id')
  updateModulo(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.modulosService.updateModulo(id, updateModuloDto);
  }

  @Delete('modulos/:id')
  deleteModulo(@Param('id') id: string) {
    return this.modulosService.deleteModulo(id);
  }

  // ==========================================
  // SUBMODULOS
  // ==========================================

  @Post('modulos/:moduloId/submodulos')
  createSubModulo(@Param('moduloId') moduloId: string, @Body() createSubModuloDto: CreateSubModuloDto) {
    return this.modulosService.createSubModulo(moduloId, createSubModuloDto);
  }

  @Patch('submodulos/:id')
  updateSubModulo(@Param('id') id: string, @Body() updateSubModuloDto: UpdateSubModuloDto) {
    return this.modulosService.updateSubModulo(id, updateSubModuloDto);
  }

  @Delete('submodulos/:id')
  deleteSubModulo(@Param('id') id: string) {
    return this.modulosService.deleteSubModulo(id);
  }

  // ==========================================
  // CLASIFICADORES
  // ==========================================

  @Post('submodulos/:subModuloId/clasificadores')
  createClasificador(@Param('subModuloId') subModuloId: string, @Body() createClasificadorDto: CreateClasificadorDto) {
    return this.modulosService.createClasificador(subModuloId, createClasificadorDto);
  }

  @Patch('clasificadores/:id')
  updateClasificador(@Param('id') id: string, @Body() updateClasificadorDto: UpdateClasificadorDto) {
    return this.modulosService.updateClasificador(id, updateClasificadorDto);
  }

  @Delete('clasificadores/:id')
  deleteClasificador(@Param('id') id: string) {
    return this.modulosService.deleteClasificador(id);
  }

  // ==========================================
  // CASOS DE PRUEBA
  // ==========================================

  @Post('submodulos/:subModuloId/casos')
  createCasoPrueba(@Param('subModuloId') subModuloId: string, @Body() createCasoPruebaDto: CreateCasoPruebaDto) {
    return this.modulosService.createCasoPrueba(subModuloId, createCasoPruebaDto);
  }

  @Patch('casos/:id')
  updateCasoPrueba(@Param('id') id: string, @Body() updateCasoPruebaDto: UpdateCasoPruebaDto) {
    return this.modulosService.updateCasoPrueba(id, updateCasoPruebaDto);
  }

  @Delete('casos/:id')
  deleteCasoPrueba(@Param('id') id: string) {
    return this.modulosService.deleteCasoPrueba(id);
  }
}

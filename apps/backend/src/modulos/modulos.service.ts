import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateModuloDto, UpdateModuloDto, 
  CreateSubModuloDto, UpdateSubModuloDto,
  CreateClasificadorDto, UpdateClasificadorDto,
  CreateCasoPruebaDto, UpdateCasoPruebaDto 
} from './dto/modulos.dto';

@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // MODULOS
  // ==========================================

  async findAllModulos() {
    const modulos = await this.prisma.modulo.findMany({
      include: {
        subModulos: {
          include: {
            casosPrueba: true,
            _count: { select: { casosPrueba: true } }
          }
        },
        _count: { select: { subModulos: true } }
      },
      orderBy: { orden: 'asc' }
    });

    return modulos.map((m: any) => {
      const { subModulos, _count, ...rest } = m;
      const casosCount = subModulos.reduce((sum: number, sm: any) => sum + sm._count.casosPrueba, 0);
      return {
        ...rest,
        _count: {
          subModulos: _count.subModulos,
          casosPrueba: casosCount
        }
      };
    });
  }

  async findModuloById(id: string) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id },
      include: {
        subModulos: {
          orderBy: { orden: 'asc' },
          include: {
            clasificadores: { orderBy: { orden: 'asc' } },
            casosPrueba: { orderBy: { orden: 'asc' } }
          }
        }
      }
    });

    if (!modulo) {
      throw new NotFoundException('Módulo no encontrado.');
    }

    return modulo;
  }

  async createModulo(dto: CreateModuloDto, userId?: string) {
    const existing = await this.prisma.modulo.findFirst({
      where: { nombre: { equals: dto.nombre, mode: 'insensitive' } }
    });

    if (existing) {
      throw new ConflictException('Ya existe un módulo con ese nombre.');
    }

    const maxOrden = await this.prisma.modulo.aggregate({
      _max: { orden: true }
    });
    const nextOrden = (maxOrden._max.orden ?? -1) + 1;

    return this.prisma.modulo.create({
      data: {
        ...dto,
        orden: nextOrden,
        creadoPorId: userId,
      }
    });
  }

  async updateModulo(id: string, dto: UpdateModuloDto) {
    const modulo = await this.prisma.modulo.findUnique({ where: { id } });
    if (!modulo) throw new NotFoundException('Módulo no encontrado.');

    if (dto.nombre && dto.nombre.toLowerCase() !== modulo.nombre.toLowerCase()) {
      const existing = await this.prisma.modulo.findFirst({
        where: { nombre: { equals: dto.nombre, mode: 'insensitive' } }
      });
      if (existing) {
        throw new ConflictException('Ya existe un módulo con ese nombre.');
      }
    }

    return this.prisma.modulo.update({
      where: { id },
      data: dto
    });
  }

  async deleteModulo(id: string) {
    const modulo = await this.prisma.modulo.findUnique({ where: { id } });
    if (!modulo) throw new NotFoundException('Módulo no encontrado.');

    try {
      await this.prisma.modulo.delete({ where: { id } });
      return { message: 'Módulo eliminado exitosamente.' };
    } catch (error: any) {
      // In future phase, restricted FKs will throw errors here
      if (error.code === 'P2003') {
        throw new ConflictException('No puedes eliminar este módulo: tiene casos de prueba en uso en una campaña activa.');
      }
      throw error;
    }
  }

  // ==========================================
  // SUBMODULOS
  // ==========================================

  async createSubModulo(moduloId: string, dto: CreateSubModuloDto) {
    const modulo = await this.prisma.modulo.findUnique({ where: { id: moduloId } });
    if (!modulo) throw new NotFoundException('Módulo no encontrado.');

    const maxOrden = await this.prisma.subModulo.aggregate({
      where: { moduloId },
      _max: { orden: true }
    });
    const nextOrden = (maxOrden._max.orden ?? -1) + 1;

    return this.prisma.subModulo.create({
      data: {
        ...dto,
        moduloId,
        orden: nextOrden
      }
    });
  }

  async updateSubModulo(id: string, dto: UpdateSubModuloDto) {
    const subModulo = await this.prisma.subModulo.findUnique({ where: { id } });
    if (!subModulo) throw new NotFoundException('SubMódulo no encontrado.');

    return this.prisma.subModulo.update({
      where: { id },
      data: dto
    });
  }

  async deleteSubModulo(id: string) {
    const subModulo = await this.prisma.subModulo.findUnique({ where: { id } });
    if (!subModulo) throw new NotFoundException('SubMódulo no encontrado.');

    await this.prisma.subModulo.delete({ where: { id } });
    return { message: 'SubMódulo eliminado exitosamente.' };
  }

  // ==========================================
  // CLASIFICADORES
  // ==========================================

  async createClasificador(subModuloId: string, dto: CreateClasificadorDto) {
    const subModulo = await this.prisma.subModulo.findUnique({ where: { id: subModuloId } });
    if (!subModulo) throw new NotFoundException('SubMódulo no encontrado.');

    const maxOrden = await this.prisma.clasificador.aggregate({
      where: { subModuloId },
      _max: { orden: true }
    });
    const nextOrden = (maxOrden._max.orden ?? -1) + 1;

    return this.prisma.clasificador.create({
      data: {
        ...dto,
        subModuloId,
        orden: nextOrden
      }
    });
  }

  async updateClasificador(id: string, dto: UpdateClasificadorDto) {
    const clasificador = await this.prisma.clasificador.findUnique({ where: { id } });
    if (!clasificador) throw new NotFoundException('Clasificador no encontrado.');

    return this.prisma.clasificador.update({
      where: { id },
      data: dto
    });
  }

  async deleteClasificador(id: string) {
    const clasificador = await this.prisma.clasificador.findUnique({ where: { id } });
    if (!clasificador) throw new NotFoundException('Clasificador no encontrado.');

    await this.prisma.clasificador.delete({ where: { id } });
    return { message: 'Clasificador eliminado exitosamente.' };
  }

  // ==========================================
  // CASOS DE PRUEBA
  // ==========================================

  async createCasoPrueba(subModuloId: string, dto: CreateCasoPruebaDto) {
    const subModulo = await this.prisma.subModulo.findUnique({ where: { id: subModuloId } });
    if (!subModulo) throw new NotFoundException('SubMódulo no encontrado.');

    if (dto.clasificadorId) {
      const clasificador = await this.prisma.clasificador.findUnique({ where: { id: dto.clasificadorId } });
      if (!clasificador) {
        throw new NotFoundException('Clasificador no encontrado.');
      }
      if (clasificador.subModuloId !== subModuloId) {
        throw new BadRequestException('El clasificador no pertenece a este submódulo.');
      }
    }

    const maxOrden = await this.prisma.casoPrueba.aggregate({
      where: { subModuloId },
      _max: { orden: true }
    });
    const nextOrden = (maxOrden._max.orden ?? -1) + 1;

    return this.prisma.casoPrueba.create({
      data: {
        nombre: dto.nombre,
        clasificadorId: dto.clasificadorId,
        subModuloId,
        orden: nextOrden
      }
    });
  }

  async updateCasoPrueba(id: string, dto: UpdateCasoPruebaDto) {
    const caso = await this.prisma.casoPrueba.findUnique({ where: { id } });
    if (!caso) throw new NotFoundException('Caso de prueba no encontrado.');

    if (dto.clasificadorId !== undefined && dto.clasificadorId !== null) {
      const clasificador = await this.prisma.clasificador.findUnique({ where: { id: dto.clasificadorId } });
      if (!clasificador) {
        throw new NotFoundException('Clasificador no encontrado.');
      }
      if (clasificador.subModuloId !== caso.subModuloId) {
        throw new BadRequestException('El clasificador no pertenece a este submódulo.');
      }
    }

    return this.prisma.casoPrueba.update({
      where: { id },
      data: dto
    });
  }

  async deleteCasoPrueba(id: string) {
    const caso = await this.prisma.casoPrueba.findUnique({ where: { id } });
    if (!caso) throw new NotFoundException('Caso de prueba no encontrado.');

    await this.prisma.casoPrueba.delete({ where: { id } });
    return { message: 'Caso de prueba eliminado exitosamente.' };
  }
}

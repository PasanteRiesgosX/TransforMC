import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma';
import { Roles } from '@vista/shared';
import {
  CreateEsquemaDto,
  UpdateEsquemaDto,
  CreatePaqueteDto,
  UpdatePaqueteDto,
  PaqueteInputDto,
} from './dto/esquemas.dto';

@Injectable()
export class EsquemasService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // HELPERS DE VALIDACIÓN
  // ==========================================

  private normalizarNombreEsquema(nombre?: string): string {
    const limpio = (nombre ?? '').trim();
    return limpio.length ? limpio : 'Esquema sin nombre';
  }

  private detectarDuplicados(ids: string[]): string[] {
    const vistos = new Set<string>();
    const duplicados = new Set<string>();
    for (const id of ids) {
      if (vistos.has(id)) duplicados.add(id);
      vistos.add(id);
    }
    return [...duplicados];
  }

  /** Todos los itemIds deben existir en el catálogo (CasoPrueba). */
  private async validarItemsExisten(itemIds: string[]): Promise<void> {
    if (!itemIds.length) return;
    const encontrados = await this.prisma.casoPrueba.findMany({
      where: { id: { in: itemIds } },
      select: { id: true },
    });
    if (encontrados.length !== itemIds.length) {
      const set = new Set(encontrados.map((c) => c.id));
      const faltantes = itemIds.filter((id) => !set.has(id));
      throw new BadRequestException(
        `Algunos ítems no existen en el catálogo: ${faltantes.join(', ')}`,
      );
    }
  }

  /** Los responsables deben existir y tener rol USER (CERTIFIER). */
  private async validarResponsables(userIds: string[]): Promise<void> {
    if (!userIds.length) return;
    const unicos = [...new Set(userIds)];
    const usuarios = await this.prisma.user.findMany({
      where: { id: { in: unicos } },
      select: { id: true, rol: true },
    });
    if (usuarios.length !== unicos.length) {
      const set = new Set(usuarios.map((u) => u.id));
      const faltantes = unicos.filter((id) => !set.has(id));
      throw new BadRequestException(
        `Algunos responsables no existen: ${faltantes.join(', ')}`,
      );
    }
    const invalidos = usuarios.filter((u) => u.rol !== Roles.CERTIFIER);
    if (invalidos.length) {
      throw new BadRequestException(
        'Solo se pueden asignar como responsables usuarios con rol USER.',
      );
    }
  }

  private async crearPaqueteTx(
    tx: Prisma.TransactionClient,
    esquemaId: string,
    pq: PaqueteInputDto,
    orden: number,
  ) {
    const itemIds = [...new Set(pq.itemIds)];
    const userIds = [...new Set(pq.userIds ?? [])];
    return tx.paquete.create({
      data: {
        nombre: pq.nombre.trim(),
        orden,
        esquemaId,
        items: { create: itemIds.map((casoPruebaId) => ({ casoPruebaId, esquemaId })) },
        responsables: { create: userIds.map((usuarioId) => ({ usuarioId })) },
      },
    });
  }

  // ==========================================
  // FORMATEO DE RESPUESTAS
  // ==========================================

  private static detalleInclude = {
    paquetes: {
      orderBy: { orden: 'asc' as const },
      include: {
        items: {
          include: {
            casoPrueba: { select: { id: true, nombre: true, subModuloId: true } },
          },
        },
        responsables: {
          include: {
            usuario: { select: { id: true, nombre: true, apellido: true, cargo: true } },
          },
        },
      },
    },
  };

  private formatDetalle(esquema: any) {
    return {
      id: esquema.id,
      nombre: esquema.nombre,
      ambiente: esquema.ambiente,
      creadoPorId: esquema.creadoPorId,
      creadoEn: esquema.creadoEn,
      actualizadoEn: esquema.actualizadoEn,
      paquetes: esquema.paquetes.map((pq: any) => ({
        id: pq.id,
        nombre: pq.nombre,
        orden: pq.orden,
        itemIds: pq.items.map((i: any) => i.casoPruebaId),
        items: pq.items.map((i: any) => ({
          casoPruebaId: i.casoPruebaId,
          nombre: i.casoPrueba.nombre,
          subModuloId: i.casoPrueba.subModuloId,
        })),
        userIds: pq.responsables.map((r: any) => r.usuarioId),
        responsables: pq.responsables.map((r: any) => ({
          id: r.usuario.id,
          nombre: r.usuario.nombre,
          apellido: r.usuario.apellido,
          cargo: r.usuario.cargo,
        })),
      })),
    };
  }

  // ==========================================
  // ESQUEMAS
  // ==========================================

  /** Tarjetas del listado: nombre, ambiente, #paquetes, responsables y fecha. */
  async findAll() {
    const esquemas = await this.prisma.esquema.findMany({
      orderBy: { creadoEn: 'desc' },
      include: {
        paquetes: {
          include: {
            _count: { select: { items: true } },
            responsables: {
              include: {
                usuario: { select: { id: true, nombre: true, apellido: true } },
              },
            },
          },
        },
      },
    });

    return esquemas.map((sch: any) => {
      const totalItems = sch.paquetes.reduce(
        (sum: number, p: any) => sum + p._count.items,
        0,
      );
      const respMap = new Map<string, any>();
      sch.paquetes.forEach((p: any) =>
        p.responsables.forEach((r: any) => respMap.set(r.usuario.id, r.usuario)),
      );
      return {
        id: sch.id,
        nombre: sch.nombre,
        ambiente: sch.ambiente,
        creadoEn: sch.creadoEn,
        responsables: [...respMap.values()],
        _count: {
          paquetes: sch.paquetes.length,
          items: totalItems,
        },
      };
    });
  }

  async findOne(id: string) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id },
      include: EsquemasService.detalleInclude,
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');
    return this.formatDetalle(esquema);
  }

  /** Crea un esquema completo con todos sus paquetes en una transacción. */
  async crear(dto: CreateEsquemaDto, creadoPorId?: string) {
    const paquetes = dto.paquetes;

    // Regla 3: un mismo ítem no puede estar en dos paquetes del mismo esquema
    // (ni repetido dentro de un mismo paquete).
    const todosLosItems = paquetes.flatMap((p) => p.itemIds);
    if (this.detectarDuplicados(todosLosItems).length) {
      throw new BadRequestException(
        'Un mismo ítem no puede pertenecer a dos paquetes del mismo esquema.',
      );
    }

    await this.validarItemsExisten([...new Set(todosLosItems)]);
    await this.validarResponsables(paquetes.flatMap((p) => p.userIds ?? []));

    const nombre = this.normalizarNombreEsquema(dto.nombre);
    const ambiente = dto.ambiente ?? 'Pruebas';

    const creado = await this.prisma.$transaction(async (tx) => {
      const esquema = await tx.esquema.create({
        data: { nombre, ambiente, creadoPorId },
      });
      for (let i = 0; i < paquetes.length; i++) {
        await this.crearPaqueteTx(tx, esquema.id, paquetes[i], i);
      }
      return esquema;
    });

    return this.findOne(creado.id);
  }

  /** Editar SOLO datos generales del esquema: nombre y/o ambiente. */
  async actualizar(id: string, dto: UpdateEsquemaDto) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');

    const data: Prisma.EsquemaUpdateInput = {};
    if (dto.nombre !== undefined) data.nombre = this.normalizarNombreEsquema(dto.nombre);
    if (dto.ambiente !== undefined) data.ambiente = dto.ambiente;

    await this.prisma.esquema.update({ where: { id }, data });
    return this.findOne(id);
  }

  /** Elimina el esquema completo; en cascada borra paquetes, ítems y responsables. */
  async eliminar(id: string) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');

    await this.prisma.esquema.delete({ where: { id } });
    return {
      message:
        'Esquema eliminado exitosamente. Todos sus paquetes e ítems fueron liberados.',
    };
  }

  // ==========================================
  // PAQUETES
  // ==========================================

  /** Agrega un paquete nuevo a un esquema existente (regla 14b). */
  async agregarPaquete(esquemaId: string, dto: CreatePaqueteDto) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id: esquemaId },
      select: { id: true },
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');

    const itemIds = [...new Set(dto.itemIds)];
    await this.validarItemsExisten(itemIds);

    // Regla 3/7: los ítems no pueden estar ya usados en otro paquete del esquema.
    const usados = await this.prisma.paqueteItem.findMany({
      where: { esquemaId, casoPruebaId: { in: itemIds } },
      include: {
        casoPrueba: { select: { nombre: true } },
        paquete: { select: { nombre: true } },
      },
    });
    if (usados.length) {
      const detalle = usados
        .map((u) => `"${u.casoPrueba.nombre}" (ya en "${u.paquete.nombre}")`)
        .join(', ');
      throw new BadRequestException(
        `Algunos ítems ya están asignados a otro paquete de este esquema: ${detalle}`,
      );
    }

    await this.validarResponsables(dto.userIds ?? []);

    const maxOrden = await this.prisma.paquete.aggregate({
      where: { esquemaId },
      _max: { orden: true },
    });
    const orden = (maxOrden._max.orden ?? -1) + 1;

    await this.prisma.$transaction(async (tx) => {
      await this.crearPaqueteTx(tx, esquemaId, { ...dto, itemIds }, orden);
    });

    return this.findOne(esquemaId);
  }

  /**
   * Editar un paquete ya creado: SOLO renombrar y/o reasignar responsables.
   * No se pueden cambiar sus ítems desde aquí (regla 8).
   */
  async actualizarPaquete(id: string, dto: UpdatePaqueteDto) {
    const paquete = await this.prisma.paquete.findUnique({
      where: { id },
      select: { id: true, esquemaId: true },
    });
    if (!paquete) throw new NotFoundException('Paquete no encontrado.');

    if (dto.userIds !== undefined) {
      await this.validarResponsables(dto.userIds);
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.nombre !== undefined) {
        await tx.paquete.update({
          where: { id },
          data: { nombre: dto.nombre.trim() },
        });
      }
      if (dto.userIds !== undefined) {
        // Reemplazo total de responsables.
        await tx.paqueteResponsable.deleteMany({ where: { paqueteId: id } });
        const unicos = [...new Set(dto.userIds)];
        if (unicos.length) {
          await tx.paqueteResponsable.createMany({
            data: unicos.map((usuarioId) => ({ paqueteId: id, usuarioId })),
          });
        }
      }
    });

    return this.findOne(paquete.esquemaId);
  }

  /** Elimina un paquete; en cascada libera sus ítems para reasignarlos (regla 9). */
  async eliminarPaquete(id: string) {
    const paquete = await this.prisma.paquete.findUnique({
      where: { id },
      select: { esquemaId: true },
    });
    if (!paquete) throw new NotFoundException('Paquete no encontrado.');

    await this.prisma.paquete.delete({ where: { id } });
    return this.findOne(paquete.esquemaId);
  }
}

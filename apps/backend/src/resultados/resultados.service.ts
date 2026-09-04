import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Bloque de métricas común a todos los niveles del drill-down (esquema, módulo,
 * submódulo). El frontend NO recalcula nada de esto: solo mapea `calidad` a un
 * color de semáforo y `avance` al ancho de la barra de progreso.
 *
 * - `avance`  → COMPLETITUD: cuánto se ha revisado. (ok + fail) / total
 * - `calidad` → CALIDAD de lo revisado: ok / (ok + fail). `null` cuando todavía
 *   nadie certificó nada, para que el semáforo se pinte APAGADO en vez de rojo.
 */
export interface Metricas {
  total: number;
  ok: number;
  fail: number;
  pendientes: number;
  avance: number;
  calidad: number | null;
}

/** Un responsable tal como lo consume la UI. */
export interface ResponsableDto {
  id: string;
  nombre: string;
  apellido: string;
}

@Injectable()
export class ResultadosService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Calcula el bloque de métricas a partir de los ResultadoItem de un conjunto
   * de PaqueteItem. Un PaqueteItem SIN ResultadoItem cuenta como pendiente.
   */
  private calcularMetricas(resultados: ({ estado: string } | null)[]): Metricas {
    const total = resultados.length;
    let ok = 0;
    let fail = 0;
    for (const r of resultados) {
      if (r?.estado === 'aprobado') ok++;
      else if (r?.estado === 'rechazado') fail++;
    }
    const certificados = ok + fail;
    return {
      total,
      ok,
      fail,
      pendientes: total - certificados,
      avance: total ? Math.round((certificados / total) * 100) : 0,
      calidad: certificados ? Math.round((ok / certificados) * 100) : null,
    };
  }

  /** Deduplica responsables por id conservando el orden de aparición. */
  private dedupResponsables(lista: ResponsableDto[]): ResponsableDto[] {
    const mapa = new Map<string, ResponsableDto>();
    for (const r of lista) if (!mapa.has(r.id)) mapa.set(r.id, r);
    return [...mapa.values()];
  }

  /** Responsables del paquete al que pertenece un PaqueteItem. */
  private responsablesDeItem(item: any): ResponsableDto[] {
    return (item.paquete?.responsables ?? []).map((r: any) => ({
      id: r.usuario.id,
      nombre: r.usuario.nombre,
      apellido: r.usuario.apellido,
    }));
  }

  private async buscarEsquema(esquemaId: string) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id: esquemaId },
      select: { id: true, nombre: true, ambiente: true, creadoEn: true },
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');
    return esquema;
  }

  // ==========================================
  // NIVEL 0 — VISTA GLOBAL (lista de esquemas)
  // ==========================================

  /**
   * KPIs acumulados + una tarjeta por esquema. Los esquemas son entornos de
   * testeo AISLADOS: las métricas de cada uno se calculan solo con sus propios
   * ítems, así que crear un esquema nuevo nunca baja el avance de otro.
   */
  async overview() {
    const [esquemas, items] = await Promise.all([
      this.prisma.esquema.findMany({
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
      }),
      this.prisma.paqueteItem.findMany({
        select: { esquemaId: true, resultado: { select: { estado: true } } },
      }),
    ]);

    // Agrupa los resultados por esquema en una sola pasada.
    const porEsquema = new Map<string, ({ estado: string } | null)[]>();
    for (const it of items) {
      const lista = porEsquema.get(it.esquemaId) ?? [];
      lista.push(it.resultado);
      porEsquema.set(it.esquemaId, lista);
    }

    return {
      // Acumulado de TODOS los esquemas, solo para los 4 stat-card de arriba.
      totales: this.calcularMetricas(items.map((i) => i.resultado)),
      esquemas: esquemas.map((sch: any) => {
        const totalItems = sch.paquetes.reduce(
          (sum: number, p: any) => sum + p._count.items,
          0,
        );
        const responsables = this.dedupResponsables(
          sch.paquetes.flatMap((p: any) =>
            p.responsables.map((r: any) => ({
              id: r.usuario.id,
              nombre: r.usuario.nombre,
              apellido: r.usuario.apellido,
            })),
          ),
        );
        return {
          id: sch.id,
          nombre: sch.nombre,
          ambiente: sch.ambiente,
          creadoEn: sch.creadoEn,
          responsables,
          _count: { paquetes: sch.paquetes.length, items: totalItems },
          metricas: this.calcularMetricas(porEsquema.get(sch.id) ?? []),
        };
      }),
    };
  }

  // ==========================================
  // NIVEL 1 — MÓDULOS DE UN ESQUEMA
  // ==========================================

  /**
   * Módulos que participan en el esquema. La jerarquía se respeta SIEMPRE: aunque
   * el admin haya seleccionado submódulos sueltos o casos de prueba sueltos, el
   * primer nivel del drill-down son los módulos a los que esos ítems pertenecen.
   */
  async porEsquema(esquemaId: string) {
    const esquema = await this.buscarEsquema(esquemaId);

    const items = await this.prisma.paqueteItem.findMany({
      where: { esquemaId },
      select: {
        resultado: { select: { estado: true } },
        casoPrueba: {
          select: {
            subModulo: {
              select: {
                id: true,
                modulo: { select: { id: true, nombre: true, orden: true } },
              },
            },
          },
        },
      },
    });

    // Agrupa por módulo, contando además cuántos submódulos distintos aporta.
    const grupos = new Map<
      string,
      {
        id: string;
        nombre: string;
        orden: number;
        subModuloIds: Set<string>;
        resultados: ({ estado: string } | null)[];
      }
    >();

    for (const it of items) {
      const sub = it.casoPrueba.subModulo;
      const mod = sub.modulo;
      const grupo = grupos.get(mod.id) ?? {
        id: mod.id,
        nombre: mod.nombre,
        orden: mod.orden,
        subModuloIds: new Set<string>(),
        resultados: [],
      };
      grupo.subModuloIds.add(sub.id);
      grupo.resultados.push(it.resultado);
      grupos.set(mod.id, grupo);
    }

    const modulos = [...grupos.values()]
      .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
      .map((g) => ({
        id: g.id,
        nombre: g.nombre,
        subModulosCount: g.subModuloIds.size,
        metricas: this.calcularMetricas(g.resultados),
      }));

    return {
      esquema,
      metricas: this.calcularMetricas(items.map((i) => i.resultado)),
      modulos,
    };
  }

  // ==========================================
  // NIVEL 2 — SUBMÓDULOS DE UN MÓDULO EN EL ESQUEMA
  // ==========================================

  /**
   * Submódulos de ese módulo que tienen al menos un ítem EN ESTE esquema.
   * Nunca se muestra un submódulo del catálogo que el admin no haya seleccionado.
   */
  async porModulo(esquemaId: string, moduloId: string) {
    const esquema = await this.buscarEsquema(esquemaId);

    const modulo = await this.prisma.modulo.findUnique({
      where: { id: moduloId },
      select: { id: true, nombre: true },
    });
    if (!modulo) throw new NotFoundException('Módulo no encontrado.');

    const items = await this.prisma.paqueteItem.findMany({
      where: { esquemaId, casoPrueba: { subModulo: { moduloId } } },
      select: {
        resultado: { select: { estado: true } },
        paquete: {
          select: {
            responsables: {
              include: {
                usuario: { select: { id: true, nombre: true, apellido: true } },
              },
            },
          },
        },
        casoPrueba: {
          select: {
            subModulo: { select: { id: true, nombre: true, orden: true } },
          },
        },
      },
    });

    if (!items.length) {
      throw new NotFoundException(
        'Este módulo no forma parte del esquema seleccionado.',
      );
    }

    const grupos = new Map<
      string,
      {
        id: string;
        nombre: string;
        orden: number;
        responsables: ResponsableDto[];
        resultados: ({ estado: string } | null)[];
      }
    >();

    for (const it of items) {
      const sub = it.casoPrueba.subModulo;
      const grupo = grupos.get(sub.id) ?? {
        id: sub.id,
        nombre: sub.nombre,
        orden: sub.orden,
        responsables: [],
        resultados: [],
      };
      grupo.responsables.push(...this.responsablesDeItem(it));
      grupo.resultados.push(it.resultado);
      grupos.set(sub.id, grupo);
    }

    const subModulos = [...grupos.values()]
      .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
      .map((g) => ({
        id: g.id,
        nombre: g.nombre,
        responsables: this.dedupResponsables(g.responsables),
        metricas: this.calcularMetricas(g.resultados),
      }));

    return {
      esquema,
      modulo,
      metricas: this.calcularMetricas(items.map((i) => i.resultado)),
      subModulos,
    };
  }

  // ==========================================
  // NIVEL 3 — CASOS DE PRUEBA DE UN SUBMÓDULO
  // ==========================================

  /**
   * Último nivel: la tabla. Devuelve SOLO los casos de prueba que el admin
   * seleccionó al armar el esquema, nunca el submódulo completo del catálogo.
   */
  async porSubModulo(esquemaId: string, subModuloId: string) {
    const esquema = await this.buscarEsquema(esquemaId);

    const subModulo = await this.prisma.subModulo.findUnique({
      where: { id: subModuloId },
      select: {
        id: true,
        nombre: true,
        modulo: { select: { id: true, nombre: true } },
      },
    });
    if (!subModulo) throw new NotFoundException('SubMódulo no encontrado.');

    const items = await this.prisma.paqueteItem.findMany({
      where: { esquemaId, casoPrueba: { subModuloId } },
      select: {
        id: true,
        casoPrueba: {
          select: {
            id: true,
            nombre: true,
            orden: true,
            clasificador: { select: { nombre: true } },
          },
        },
        paquete: {
          select: {
            id: true,
            nombre: true,
            responsables: {
              include: {
                usuario: { select: { id: true, nombre: true, apellido: true } },
              },
            },
          },
        },
        resultado: {
          select: {
            estado: true,
            cambio: true,
            comentarioFalla: true,
            comentarioCambio: true,
            certificadoEn: true,
            certificadoPor: {
              select: { id: true, nombre: true, apellido: true },
            },
          },
        },
      },
    });

    if (!items.length) {
      throw new NotFoundException(
        'Este submódulo no forma parte del esquema seleccionado.',
      );
    }

    const casos = items
      .sort(
        (a, b) =>
          a.casoPrueba.orden - b.casoPrueba.orden ||
          a.casoPrueba.nombre.localeCompare(b.casoPrueba.nombre, 'es'),
      )
      .map((it) => ({
        paqueteItemId: it.id,
        casoPruebaId: it.casoPrueba.id,
        nombre: it.casoPrueba.nombre,
        clasificador: it.casoPrueba.clasificador?.nombre ?? null,
        paquete: { id: it.paquete.id, nombre: it.paquete.nombre },
        // Sin fila en ResultadoItem = pendiente (nunca null, nunca error).
        estado: it.resultado?.estado ?? 'pendiente',
        cambio: it.resultado?.cambio === true,
        // Los dos comentarios que puede dejar el certificador (Fase 5). La tabla
        // de Resultados los muestra juntos en la columna "Comentario".
        comentarioFalla: it.resultado?.comentarioFalla ?? null,
        comentarioCambio: it.resultado?.comentarioCambio ?? null,
        certificadoPor: it.resultado?.certificadoPor ?? null,
        certificadoEn: it.resultado?.certificadoEn ?? null,
        responsables: this.responsablesDeItem(it),
      }));

    return {
      esquema,
      modulo: subModulo.modulo,
      subModulo: { id: subModulo.id, nombre: subModulo.nombre },
      metricas: this.calcularMetricas(items.map((i) => i.resultado)),
      // Opciones del filtro "Responsable" — solo quienes aparecen en esta tabla.
      responsablesDisponibles: this.dedupResponsables(
        casos.flatMap((c) => c.responsables),
      ).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
      casos,
    };
  }
}

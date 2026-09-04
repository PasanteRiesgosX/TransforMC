import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarRespuestaDto } from './dto/certificaciones.dto';

/** Una respuesta guardada, tal como la lee el chequeo de "listo para enviar". */
interface RespuestaGuardada {
  estado: string;
  cambio: boolean | null;
  comentarioFalla: string | null;
  comentarioCambio: string | null;
}

/** Estado del envío de un esquema para un certificador concreto. */
export interface EstadoEnvio {
  enviado: boolean;
  enviadoEn: Date | null;
  /** Casos que todavía no están listos para enviar. */
  incompletos: number;
  /** Solo se puede enviar si no está enviado y no queda ningún incompleto. */
  puedeEnviar: boolean;
}

/**
 * Progreso de un conjunto de casos asignados al certificador.
 * `done` cuenta los que ya tienen respuesta a la pregunta 1 (estado distinto de
 * "pendiente"), igual que el cálculo de la Fase 4.
 */
export interface Progreso {
  total: number;
  ok: number;
  fail: number;
  pendientes: number;
  done: number;
  pct: number;
}

@Injectable()
export class CertificacionesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // HELPERS
  // ==========================================

  private progreso(resultados: ({ estado: string } | null)[]): Progreso {
    const total = resultados.length;
    let ok = 0;
    let fail = 0;
    for (const r of resultados) {
      if (r?.estado === 'aprobado') ok++;
      else if (r?.estado === 'rechazado') fail++;
    }
    const done = ok + fail;
    return {
      total,
      ok,
      fail,
      pendientes: total - done,
      done,
      pct: total ? Math.round((done / total) * 100) : 0,
    };
  }

  /**
   * Filtro base: los PaqueteItem de los paquetes donde ESTE usuario es
   * responsable. Todo lo que ve o escribe el certificador pasa por aquí, así que
   * nunca puede alcanzar un ítem que no le asignaron.
   */
  private itemsDelUsuario(usuarioId: string, extra: Record<string, any> = {}) {
    return {
      paquete: { responsables: { some: { usuarioId } } },
      ...extra,
    };
  }

  /**
   * Un caso está listo para enviarse cuando contestó las DOS preguntas y llenó
   * los comentarios que su combinación exige (los que la UI marca con `*`).
   */
  private casoListo(r: RespuestaGuardada | null): boolean {
    if (!r || r.estado === 'pendiente' || r.cambio === null) return false;
    if (r.estado === 'rechazado' && !r.comentarioFalla?.trim()) return false;
    if (r.cambio === true && !r.comentarioCambio?.trim()) return false;
    return true;
  }

  /**
   * Estado del envío de un esquema para este usuario. Es por (esquema, usuario):
   * si dos responsables comparten esquema, cada uno envía por su cuenta y uno no
   * bloquea al otro.
   */
  private async estadoEnvio(
    usuarioId: string,
    esquemaId: string,
    respuestas?: (RespuestaGuardada | null)[],
  ): Promise<EstadoEnvio> {
    const envio = await this.prisma.envioCertificacion.findUnique({
      where: { esquemaId_usuarioId: { esquemaId, usuarioId } },
      select: { enviadoEn: true },
    });

    const lista =
      respuestas ??
      (
        await this.prisma.paqueteItem.findMany({
          where: this.itemsDelUsuario(usuarioId, { esquemaId }),
          select: {
            resultado: {
              select: {
                estado: true,
                cambio: true,
                comentarioFalla: true,
                comentarioCambio: true,
              },
            },
          },
        })
      ).map((i) => i.resultado);

    const incompletos = lista.filter((r) => !this.casoListo(r)).length;

    return {
      enviado: !!envio,
      enviadoEn: envio?.enviadoEn ?? null,
      incompletos,
      puedeEnviar: !envio && incompletos === 0 && lista.length > 0,
    };
  }

  /** Lanza si el esquema ya fue enviado por este usuario (queda de solo lectura). */
  private async asegurarNoEnviado(usuarioId: string, esquemaId: string) {
    const envio = await this.prisma.envioCertificacion.findUnique({
      where: { esquemaId_usuarioId: { esquemaId, usuarioId } },
      select: { id: true },
    });
    if (envio) {
      throw new ForbiddenException(
        'Ya enviaste esta certificación. Tus respuestas quedaron consolidadas y no se pueden modificar.',
      );
    }
  }

  // ==========================================
  // NIVEL 0 — MIS CERTIFICACIONES (esquemas asignados)
  // ==========================================

  async misEsquemas(usuarioId: string) {
    const [items, envios] = await Promise.all([
      this.prisma.paqueteItem.findMany({
        where: this.itemsDelUsuario(usuarioId),
        select: {
          esquemaId: true,
          resultado: {
            select: {
              estado: true,
              cambio: true,
              comentarioFalla: true,
              comentarioCambio: true,
            },
          },
          esquema: {
            select: { id: true, nombre: true, ambiente: true, creadoEn: true },
          },
        },
      }),
      this.prisma.envioCertificacion.findMany({
        where: { usuarioId },
        select: { esquemaId: true, enviadoEn: true },
      }),
    ]);

    const enviadoPor = new Map(envios.map((e) => [e.esquemaId, e.enviadoEn]));

    // Agrupa por esquema en una sola pasada.
    const grupos = new Map<string, { esquema: any; resultados: any[] }>();
    for (const it of items) {
      const g = grupos.get(it.esquemaId) ?? { esquema: it.esquema, resultados: [] };
      g.resultados.push(it.resultado);
      grupos.set(it.esquemaId, g);
    }

    return [...grupos.values()]
      .sort((a, b) => +new Date(b.esquema.creadoEn) - +new Date(a.esquema.creadoEn))
      .map((g) => {
        const enviadoEn = enviadoPor.get(g.esquema.id) ?? null;
        const incompletos = g.resultados.filter((r) => !this.casoListo(r)).length;
        return {
          id: g.esquema.id,
          nombre: g.esquema.nombre,
          ambiente: g.esquema.ambiente,
          creadoEn: g.esquema.creadoEn,
          progreso: this.progreso(g.resultados),
          envio: {
            enviado: !!enviadoEn,
            enviadoEn,
            incompletos,
            puedeEnviar: !enviadoEn && incompletos === 0 && g.resultados.length > 0,
          },
        };
      });
  }

  // ==========================================
  // NIVEL 1 — MÓDULOS DEL ESQUEMA (solo los míos)
  // ==========================================

  /**
   * Módulos con sus submódulos. Respeta la jerarquía completa: aunque al
   * certificador le hayan asignado un solo caso de prueba suelto, este nivel
   * muestra el MÓDULO al que pertenece, y dentro solo el submódulo de ese caso.
   */
  async misModulos(usuarioId: string, esquemaId: string) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id: esquemaId },
      select: { id: true, nombre: true, ambiente: true },
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');

    const items = await this.prisma.paqueteItem.findMany({
      where: this.itemsDelUsuario(usuarioId, { esquemaId }),
      select: {
        resultado: {
          select: {
            estado: true,
            cambio: true,
            comentarioFalla: true,
            comentarioCambio: true,
          },
        },
        casoPrueba: {
          select: {
            subModulo: {
              select: {
                id: true,
                nombre: true,
                orden: true,
                modulo: { select: { id: true, nombre: true, orden: true } },
              },
            },
          },
        },
      },
    });

    if (!items.length) {
      throw new ForbiddenException('No tienes casos de prueba asignados en este esquema.');
    }

    const envio = await this.estadoEnvio(
      usuarioId,
      esquemaId,
      items.map((i) => i.resultado),
    );

    // Módulo → SubMódulo → resultados
    const modulos = new Map<string, any>();
    for (const it of items) {
      const sub = it.casoPrueba.subModulo;
      const mod = sub.modulo;

      const gm = modulos.get(mod.id) ?? {
        id: mod.id,
        nombre: mod.nombre,
        orden: mod.orden,
        subs: new Map<string, any>(),
        resultados: [],
      };
      gm.resultados.push(it.resultado);

      const gs = gm.subs.get(sub.id) ?? {
        id: sub.id,
        nombre: sub.nombre,
        orden: sub.orden,
        resultados: [],
      };
      gs.resultados.push(it.resultado);

      gm.subs.set(sub.id, gs);
      modulos.set(mod.id, gm);
    }

    return {
      esquema,
      envio,
      progreso: this.progreso(items.map((i) => i.resultado)),
      modulos: [...modulos.values()]
        .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
        .map((m) => ({
          id: m.id,
          nombre: m.nombre,
          progreso: this.progreso(m.resultados),
          subModulos: [...m.subs.values()]
            .sort((a: any, b: any) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
            .map((s: any) => ({
              id: s.id,
              nombre: s.nombre,
              progreso: this.progreso(s.resultados),
            })),
        })),
    };
  }

  // ==========================================
  // NIVEL 2 — PANTALLA DE CERTIFICACIÓN
  // ==========================================

  /**
   * Los casos de prueba del módulo agrupados por submódulo, con la respuesta
   * guardada de cada uno. Solo los casos asignados a este usuario.
   */
  async misCasos(usuarioId: string, esquemaId: string, moduloId: string) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id: esquemaId },
      select: { id: true, nombre: true, ambiente: true },
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');

    const modulo = await this.prisma.modulo.findUnique({
      where: { id: moduloId },
      select: { id: true, nombre: true },
    });
    if (!modulo) throw new NotFoundException('Módulo no encontrado.');

    const items = await this.prisma.paqueteItem.findMany({
      where: this.itemsDelUsuario(usuarioId, {
        esquemaId,
        casoPrueba: { subModulo: { moduloId } },
      }),
      select: {
        id: true,
        casoPrueba: {
          select: {
            id: true,
            nombre: true,
            orden: true,
            clasificador: { select: { nombre: true } },
            subModulo: { select: { id: true, nombre: true, orden: true } },
          },
        },
        resultado: {
          select: {
            estado: true,
            cambio: true,
            comentarioFalla: true,
            comentarioCambio: true,
            actualizadoEn: true,
          },
        },
      },
    });

    if (!items.length) {
      throw new ForbiddenException('No tienes casos de prueba asignados en este módulo.');
    }

    // Se calcula sobre TODO el esquema, no solo este módulo: el envío cierra el
    // esquema completo, así que la barra superior debe reflejar eso.
    const envio = await this.estadoEnvio(usuarioId, esquemaId);

    // Agrupa por submódulo, conservando la jerarquía.
    const subs = new Map<string, any>();
    for (const it of items) {
      const sub = it.casoPrueba.subModulo;
      const g = subs.get(sub.id) ?? {
        id: sub.id,
        nombre: sub.nombre,
        orden: sub.orden,
        casos: [],
      };
      g.casos.push({
        paqueteItemId: it.id,
        casoPruebaId: it.casoPrueba.id,
        nombre: it.casoPrueba.nombre,
        orden: it.casoPrueba.orden,
        clasificador: it.casoPrueba.clasificador?.nombre ?? null,
        // Sin fila en ResultadoItem = todavía sin responder.
        estado: it.resultado?.estado ?? 'pendiente',
        cambio: it.resultado?.cambio ?? null,
        comentarioFalla: it.resultado?.comentarioFalla ?? null,
        comentarioCambio: it.resultado?.comentarioCambio ?? null,
      });
      subs.set(sub.id, g);
    }

    return {
      esquema,
      modulo,
      envio,
      progreso: this.progreso(items.map((i) => i.resultado)),
      subModulos: [...subs.values()]
        .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
        .map((s) => ({
          id: s.id,
          nombre: s.nombre,
          casos: s.casos.sort(
            (a: any, b: any) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'),
          ),
        })),
    };
  }

  // ==========================================
  // AUTOGUARDADO DE UNA RESPUESTA
  // ==========================================

  /**
   * Guarda (o crea) la respuesta de un caso de prueba. Es un upsert porque el
   * ResultadoItem no existe hasta que el certificador contesta por primera vez.
   *
   * Normaliza los comentarios: si la combinación de respuestas deja de pedir un
   * comentario, se borra. Así el admin nunca ve en Resultados un texto que ya no
   * corresponde a ninguna pregunta visible.
   */
  async guardarRespuesta(
    usuarioId: string,
    paqueteItemId: string,
    dto: ActualizarRespuestaDto,
  ) {
    const item = await this.prisma.paqueteItem.findFirst({
      where: this.itemsDelUsuario(usuarioId, { id: paqueteItemId }),
      select: { id: true, esquemaId: true, resultado: true },
    });
    // Mismo mensaje exista o no: no revelamos si el ítem existe para otro usuario.
    if (!item) {
      throw new ForbiddenException('Este caso de prueba no está asignado a ti.');
    }

    // Tras enviar, el esquema queda de solo lectura para este usuario.
    await this.asegurarNoEnviado(usuarioId, item.esquemaId);

    const previo = item.resultado;

    // Estado final de las dos preguntas después de aplicar el parche.
    const estado = dto.estado ?? previo?.estado ?? 'pendiente';
    const cambio = dto.cambio !== undefined ? dto.cambio : (previo?.cambio ?? null);

    // Qué comentarios pide esta combinación.
    const pideFalla = estado === 'rechazado';
    const pideCambio = cambio === true;

    const comentarioFalla = !pideFalla
      ? null
      : dto.comentarioFalla !== undefined
        ? dto.comentarioFalla.trim() || null
        : (previo?.comentarioFalla ?? null);

    const comentarioCambio = !pideCambio
      ? null
      : dto.comentarioCambio !== undefined
        ? dto.comentarioCambio.trim() || null
        : (previo?.comentarioCambio ?? null);

    // Se sella la fecha en cuanto la pregunta 1 queda contestada.
    const yaCertificado = estado !== 'pendiente';
    const certificadoEn = yaCertificado ? (previo?.certificadoEn ?? new Date()) : null;

    const datos = {
      estado,
      cambio,
      comentarioFalla,
      comentarioCambio,
      certificadoPorId: yaCertificado ? usuarioId : null,
      certificadoEn,
    };

    const guardado = await this.prisma.resultadoItem.upsert({
      where: { paqueteItemId },
      create: { paqueteItemId, ...datos },
      update: datos,
      select: {
        estado: true,
        cambio: true,
        comentarioFalla: true,
        comentarioCambio: true,
        actualizadoEn: true,
      },
    });

    return { paqueteItemId, ...guardado };
  }

  // ==========================================
  // ENVÍO DE LA CERTIFICACIÓN
  // ==========================================

  /**
   * Cierra el esquema para este certificador: sus respuestas quedan
   * consolidadas y deja de poder modificarlas. Sigue viendo todo en solo lectura.
   *
   * Exige que no quede ningún caso incompleto. Enviar a medias dejaría al
   * usuario bloqueado con preguntas sin responder y sin forma de arreglarlo,
   * porque la reapertura es la Fase 6.
   */
  async enviarCertificacion(usuarioId: string, esquemaId: string) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id: esquemaId },
      select: { id: true, nombre: true },
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado.');

    const items = await this.prisma.paqueteItem.findMany({
      where: this.itemsDelUsuario(usuarioId, { esquemaId }),
      select: {
        resultado: {
          select: {
            estado: true,
            cambio: true,
            comentarioFalla: true,
            comentarioCambio: true,
          },
        },
      },
    });
    if (!items.length) {
      throw new ForbiddenException('No tienes casos de prueba asignados en este esquema.');
    }

    await this.asegurarNoEnviado(usuarioId, esquemaId);

    const incompletos = items.filter((i) => !this.casoListo(i.resultado)).length;
    if (incompletos > 0) {
      throw new BadRequestException(
        `Todavía te ${incompletos === 1 ? 'queda 1 caso' : `quedan ${incompletos} casos`} por completar. ` +
          'Responde las dos preguntas de cada caso y llena los comentarios obligatorios antes de enviar.',
      );
    }

    const envio = await this.prisma.envioCertificacion.create({
      data: { esquemaId, usuarioId },
      select: { enviadoEn: true },
    });

    return {
      esquemaId,
      enviado: true,
      enviadoEn: envio.enviadoEn,
      incompletos: 0,
      puedeEnviar: false,
      mensaje: `Enviaste tu certificación de "${esquema.nombre}". Tus respuestas quedaron consolidadas.`,
    };
  }
}

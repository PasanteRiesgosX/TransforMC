/**
 * FASE 5 — MIS CERTIFICACIONES (rol CERTIFIER)
 * Tipos y helpers compartidos por las pantallas del certificador.
 */

export { API, authHeaders, readError, colorFor, getHashIndex, colors } from './resultados';

/** Progreso de un conjunto de casos asignados. `pct` mide completitud. */
export interface Progreso {
  total: number;
  ok: number;
  fail: number;
  pendientes: number;
  done: number;
  pct: number;
}

/**
 * Estado del envío de un esquema para este certificador. Es por (esquema,
 * usuario): dos responsables del mismo esquema envían por separado.
 */
export interface EstadoEnvio {
  /** Ya enviado → todo el esquema queda de SOLO LECTURA para este usuario. */
  enviado: boolean;
  enviadoEn: string | null;
  /** Casos a los que les falta responder algo o llenar un comentario obligatorio. */
  incompletos: number;
  puedeEnviar: boolean;
}

export interface EsquemaAsignado {
  id: string;
  nombre: string;
  ambiente: string;
  creadoEn: string;
  progreso: Progreso;
  envio: EstadoEnvio;
}

export interface SubModuloResumen {
  id: string;
  nombre: string;
  progreso: Progreso;
}

export interface ModuloAsignado {
  id: string;
  nombre: string;
  progreso: Progreso;
  subModulos: SubModuloResumen[];
}

/** Pregunta 1. `pendiente` = todavía sin responder. */
export type EstadoCaso = 'pendiente' | 'aprobado' | 'rechazado';

export interface CasoCertificable {
  paqueteItemId: string;
  casoPruebaId: string;
  nombre: string;
  clasificador: string | null;
  estado: EstadoCaso;
  /** Pregunta 2. `null` = sin responder · true = sí cambió · false = sigue igual. */
  cambio: boolean | null;
  comentarioFalla: string | null;
  comentarioCambio: string | null;
}

export interface SubModuloConCasos {
  id: string;
  nombre: string;
  casos: CasoCertificable[];
}

// ==========================================
// LÓGICA DE LAS DOS PREGUNTAS
// ==========================================

/**
 * Qué campos de comentario pide cada combinación de respuestas.
 *
 *   funciona    + sigue igual → ninguno (ahí termina)
 *   funciona    + sí cambió   → "Cuéntanos qué pasó"
 *   no funciona + sigue igual → "¿Qué no funciona?"
 *   no funciona + sí cambió   → LOS DOS, uno por pregunta
 */
export interface CamposPedidos {
  falla: boolean;
  cambio: boolean;
}

export function camposPedidos(caso: CasoCertificable): CamposPedidos {
  return {
    falla: caso.estado === 'rechazado',
    cambio: caso.cambio === true,
  };
}

/**
 * Un caso está listo para enviarse cuando contestó las DOS preguntas y llenó los
 * comentarios que su combinación exige (los marcados con `*`). Es la misma regla
 * que valida el backend antes de dejar enviar.
 */
export function casoListo(caso: CasoCertificable): boolean {
  if (caso.estado === 'pendiente' || caso.cambio === null) return false;
  const pide = camposPedidos(caso);
  if (pide.falla && !caso.comentarioFalla?.trim()) return false;
  if (pide.cambio && !caso.comentarioCambio?.trim()) return false;
  return true;
}

export type EstadoGuardado = 'idle' | 'saving' | 'saved' | 'error';

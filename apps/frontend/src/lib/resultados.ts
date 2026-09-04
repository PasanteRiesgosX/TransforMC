/**
 * FASE 4 — RESULTADOS
 * Tipos y helpers compartidos por los cuatro niveles del drill-down.
 */

export const API = 'http://localhost:3000';

/** Paleta de acento; el color de cada tarjeta sale del hash de su id. */
export const colors = ['cian', 'morado', 'magenta', 'naranja', 'teal'] as const;

export function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

export function colorFor(id: string): string {
  return colors[getHashIndex(id, colors.length)];
}

export const readError = (err: any, fallback: string) =>
  (Array.isArray(err.response?.data?.message)
    ? err.response?.data?.message[0]
    : err.response?.data?.message) ||
  err.response?.data?.error ||
  fallback;

export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

// ==========================================
// MÉTRICAS
// ==========================================

/**
 * Lo que devuelve el backend en cada nivel. El front NO recalcula nada de esto.
 * - `avance`  → completitud: (ok + fail) / total
 * - `calidad` → calidad: ok / (ok + fail); null si todavía nadie certificó.
 */
export interface Metricas {
  total: number;
  ok: number;
  fail: number;
  pendientes: number;
  avance: number;
  calidad: number | null;
}

export interface Responsable {
  id: string;
  nombre: string;
  apellido: string;
}

export const METRICAS_VACIAS: Metricas = {
  total: 0,
  ok: 0,
  fail: 0,
  pendientes: 0,
  avance: 0,
  calidad: null,
};

// ==========================================
// SEMÁFORO — mide CALIDAD, no completitud
// ==========================================

export type Luz = 'red' | 'yellow' | 'green' | 'off';

export interface CalidadInfo {
  light: Luz;
  label: string;
  /** Clase de tag para la etiqueta textual de calidad. */
  cls: string;
  /** Clase de acento del borde izquierdo de la mod-card. */
  acento: string;
}

/**
 * Cortes definidos para la Fase 4:
 *   0–69 %  → rojo    · 70–89 % → amarillo · 90–100 % → verde
 *
 * `calidad === null` (nadie certificó todavía) NO es rojo: el semáforo se pinta
 * APAGADO. Un esquema recién creado no está "no conforme", está sin revisar.
 */
export function calidadInfo(calidad: number | null): CalidadInfo {
  if (calidad === null) {
    return {
      light: 'off',
      label: 'Sin certificaciones todavía',
      cls: 'tag-neutral',
      acento: '',
    };
  }
  if (calidad >= 90) {
    return {
      light: 'green',
      label: 'Certificación conforme',
      cls: 'tag-teal',
      acento: 'is-conforme',
    };
  }
  if (calidad >= 70) {
    return {
      light: 'yellow',
      label: 'Con observaciones',
      cls: 'tag-naranja',
      acento: '',
    };
  }
  return {
    light: 'red',
    label: 'Certificación no conforme',
    cls: 'tag-rojo',
    acento: 'has-fail',
  };
}

// ==========================================
// ESTADO DE UN CASO DE PRUEBA
// ==========================================

export type EstadoCaso = 'aprobado' | 'rechazado' | 'pendiente';

export const ESTADO_LABEL: Record<EstadoCaso, string> = {
  aprobado: 'Funciona',
  rechazado: 'No funciona',
  pendiente: 'Pendiente',
};

export const ESTADO_TAG: Record<EstadoCaso, string> = {
  aprobado: 'tag-teal',
  rechazado: 'tag-rojo',
  pendiente: 'tag-neutral',
};

export const nombreCompleto = (r: Responsable) => `${r.nombre} ${r.apellido}`;

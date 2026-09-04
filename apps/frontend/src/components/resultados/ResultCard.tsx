import React from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { Semaphore } from './Semaphore';
import { calidadInfo, colorFor, type Metricas } from '../../lib/resultados';

interface ResultCardProps {
  /** Id del nodo; de aquí sale el color del badge por hash. */
  id: string;
  /** Ícono ya construido con su size explícito (nunca un emoji). */
  icon: React.ReactNode;
  title: string;
  meta: React.ReactNode;
  /** Badge de contexto a la derecha (ambiente, por ejemplo). Opcional. */
  badge?: React.ReactNode;
  metricas: Metricas;
  /** Si se pasa, la tarjeta es navegable (cursor, hover y flecha). */
  onClick?: () => void;
  /** Slot opcional entre la meta y la barra de progreso (avatares). */
  children?: React.ReactNode;
}

/**
 * LA tarjeta de Resultados. Los tres niveles navegables (esquema, módulo,
 * submódulo) usan este mismo componente cambiando solo el contenido.
 *
 * El contenedor lleva SIEMPRE las tres clases juntas:
 *   · `mod-card` → el estilo visual base (index.css)
 *   · `group`    → habilita `group-hover:*` en los descendientes; sin esto la
 *                  flecha de drill-down nunca aparece
 *   · `relative` → ancla los hijos `absolute` a ESTA tarjeta y no al <body>
 *
 * Dos indicadores independientes que no se cruzan nunca:
 *   · semáforo → CALIDAD  (ok / (ok + fail)); apagado si nadie certificó
 *   · barra    → COMPLETITUD ((ok + fail) / total)
 */
export const ResultCard: React.FC<ResultCardProps> = ({
  id,
  icon,
  title,
  meta,
  badge,
  metricas,
  onClick,
  children,
}) => {
  const color = colorFor(id);
  const info = calidadInfo(metricas.calidad);
  const navegable = typeof onClick === 'function';
  const { ok, fail, pendientes, total, avance } = metricas;

  return (
    <div
      className={`mod-card group relative ${info.acento} ${
        navegable ? 'is-clickable' : ''
      }`.trim()}
      onClick={onClick}
      role={navegable ? 'button' : undefined}
      tabIndex={navegable ? 0 : undefined}
      onKeyDown={
        navegable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick!();
              }
            }
          : undefined
      }
    >
      {/* Fila 1 — identidad a la izquierda, estado a la derecha */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="mod-icon"
          style={{ backgroundColor: `var(--${color}-bg)`, color: `var(--${color})` }}
        >
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <Semaphore light={info.light} title={info.label} />
          {badge}
        </div>
      </div>

      {/* Fila 2 — título (+ flecha de drill-down al hover) */}
      <div className="flex items-center gap-1">
        <div className="mod-card-title mb-0">{title}</div>
        {navegable && (
          <ChevronRight
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            style={{ color: 'var(--cian)' }}
          />
        )}
      </div>

      {/* Fila 3 — meta */}
      <div className="mod-card-meta mt-1">{meta}</div>

      {/* Slot opcional (avatares de responsables en el nivel 0) */}
      {children}

      {/* Fila 4 — barra de progreso (COMPLETITUD) + porcentaje */}
      <div className="flex items-center gap-3 mt-3">
        <div className="progress-track flex-1">
          <div
            className={`progress-fill ${avance === 100 && fail === 0 ? 'pf-teal' : ''}`}
            style={{ width: `${avance}%` }}
          />
        </div>
        <span className="text-[18px] font-bold text-[var(--navy)] shrink-0">{avance}%</span>
      </div>

      {/* Fila 5 — renglón de avance */}
      <div className="text-[11.5px] text-[var(--grayLight)] mt-[6px]">
        {ok + fail}/{total} ítem{total !== 1 ? 's' : ''} certificado
        {ok + fail !== 1 ? 's' : ''}
      </div>

      {/* Fila 6 — chips de calidad */}
      <div className="progress-card-chips">
        <span className="tag tag-teal">{ok} bien</span>
        <span className={`tag ${fail > 0 ? 'tag-rojo' : 'tag-neutral'}`}>
          {fail > 0 && <AlertTriangle size={12} />}
          {fail} con fallas
        </span>
        <span className="tag tag-neutral">{pendientes} pendientes</span>
      </div>
    </div>
  );
};

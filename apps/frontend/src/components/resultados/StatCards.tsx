import React from 'react';
import type { Metricas } from '../../lib/resultados';

interface StatCardsProps {
  metricas: Metricas;
  /** Etiqueta del primer KPI; cambia según el nivel del drill-down. */
  labelAvance?: string;
}

/**
 * Los 4 KPI de la Fase 4. Se repiten en los cuatro niveles, siempre acotados al
 * nodo actual (esquema, módulo o submódulo). No los recalcules en el cliente:
 * vienen ya agregados del backend.
 */
export const StatCards: React.FC<StatCardsProps> = ({
  metricas,
  labelAvance = 'Avance global',
}) => (
  <div className="grid-4 mb-[22px]">
    <div className="stat-card">
      <p className="stat-num">{metricas.avance}%</p>
      <p className="stat-label">{labelAvance}</p>
    </div>
    <div className="stat-card">
      <p className="stat-num" style={{ color: 'var(--teal)' }}>
        {metricas.ok}
      </p>
      <p className="stat-label">Ítems que funcionan bien</p>
    </div>
    <div className="stat-card">
      <p className="stat-num" style={{ color: 'var(--rojo)' }}>
        {metricas.fail}
      </p>
      <p className="stat-label">Ítems con fallas</p>
    </div>
    <div className="stat-card">
      <p className="stat-num" style={{ color: 'var(--grayLight)' }}>
        {metricas.pendientes}
      </p>
      <p className="stat-label">Ítems pendientes</p>
    </div>
  </div>
);

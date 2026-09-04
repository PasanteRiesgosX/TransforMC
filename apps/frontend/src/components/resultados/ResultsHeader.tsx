import React from 'react';
import { Semaphore } from './Semaphore';
import { calidadInfo, colorFor, type Metricas } from '../../lib/resultados';

interface ResultsHeaderProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  badge?: React.ReactNode;
  metricas: Metricas;
}

/**
 * Encabezado de identidad de los niveles 1, 2 y 3: quién soy + qué tan bien
 * salió. El semáforo grande y la etiqueta de calidad son el mismo cálculo que
 * el de las tarjetas — nunca el avance.
 */
export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  id,
  icon,
  title,
  subtitle,
  badge,
  metricas,
}) => {
  const color = colorFor(id);
  const info = calidadInfo(metricas.calidad);

  return (
    <div className="semaphore-row mb-[22px]">
      <div
        className="mod-icon"
        style={{
          backgroundColor: `var(--${color}-bg)`,
          color: `var(--${color})`,
          marginBottom: 0,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[19px] font-bold text-[var(--navy)] m-0">{title}</h1>
          {badge}
        </div>
        <p className="text-[12.5px] text-[var(--grayLight)] m-0 mt-[2px]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Semaphore light={info.light} title={info.label} big />
        <span className={`tag ${info.cls}`} style={{ padding: '7px 13px', fontSize: '12.5px' }}>
          {info.label}
          {metricas.calidad !== null && ` · ${metricas.calidad}% de calidad`}
        </span>
      </div>
    </div>
  );
};

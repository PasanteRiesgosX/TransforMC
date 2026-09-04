import React from 'react';

interface CircularProgressProps {
  pct: number;
  size?: number;
  color?: string;
}

/**
 * Anillo de progreso de la tarjeta de esquema del certificador (equivalente al
 * `circularProgress()` de la maqueta). Mide COMPLETITUD, no calidad.
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  pct,
  size = 64,
  color = 'var(--cian)',
}) => {
  const stroke = 6;
  const radio = (size - stroke) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const avance = circunferencia * (1 - Math.min(Math.max(pct, 0), 100) / 100);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radio}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radio}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circunferencia}
        strokeDashoffset={avance}
        style={{ transition: 'stroke-dashoffset .35s ease' }}
      />
    </svg>
  );
};

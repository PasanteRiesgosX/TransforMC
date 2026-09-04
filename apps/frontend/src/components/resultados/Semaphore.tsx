import React from 'react';
import type { Luz } from '../../lib/resultados';

interface SemaphoreProps {
  light: Luz;
  title?: string;
  /** Versión grande para los encabezados de nivel. */
  big?: boolean;
}

/**
 * Semáforo bespoke de 3 luces (no es un ícono de librería, no lo reemplaces).
 * Mide CALIDAD de la certificación, no completitud. Con `light="off"` las tres
 * luces quedan apagadas — es el estado por defecto del CSS, no un color nuevo.
 */
export const Semaphore: React.FC<SemaphoreProps> = ({ light, title, big = false }) => (
  <div className={`semaphore${big ? ' semaphore-lg' : ''}`} title={title}>
    <span className={`semaphore-light light-red${light === 'red' ? ' active' : ''}`} />
    <span className={`semaphore-light light-yellow${light === 'yellow' ? ' active' : ''}`} />
    <span className={`semaphore-light light-green${light === 'green' ? ' active' : ''}`} />
  </div>
);

import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * "Mis resultados" — PLACEHOLDER de la Fase 5.
 * La pestaña existe y es navegable, pero a propósito no muestra ningún dato
 * todavía. El dashboard personal del certificador se construye en otra fase.
 */
export const CertifierResults: React.FC = () => (
  <div className="fade-in">
    <div className="page-head">
      <h1 className="page-title">Mis resultados</h1>
      <p className="page-sub">Aquí vas a ver el resumen de todo lo que has certificado.</p>
    </div>

    <div className="panel">
      <div className="empty-state">
        <div className="es-icon flex justify-center">
          <BarChart3 size={32} />
        </div>
        <div className="es-title">Todavía no hay nada que mostrar</div>
        Esta sección estará disponible más adelante.
      </div>
    </div>
  </div>
);

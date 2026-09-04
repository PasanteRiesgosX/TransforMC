import React from 'react';
import { Check, X, Paperclip, Circle } from 'lucide-react';
import {
  camposPedidos,
  type CasoCertificable,
  type EstadoCaso,
} from '../../lib/certificaciones';

interface ItemCardProps {
  caso: CasoCertificable;
  numero: number;
  /** Tras enviar la certificación el caso queda visible pero no editable. */
  soloLectura?: boolean;
  onEstado: (estado: EstadoCaso) => void;
  onCambio: (cambio: boolean) => void;
  onComentario: (campo: 'comentarioFalla' | 'comentarioCambio', valor: string) => void;
}

/** Ícono redondo de estado, arriba a la derecha de la tarjeta. */
const IconoEstado: React.FC<{ estado: EstadoCaso }> = ({ estado }) => {
  if (estado === 'aprobado') {
    return (
      <div className="item-state-icon" style={{ background: 'var(--teal)', color: '#fff' }}>
        <Check size={12} />
      </div>
    );
  }
  if (estado === 'rechazado') {
    return (
      <div className="item-state-icon" style={{ background: 'var(--rojo)', color: '#fff' }}>
        <X size={12} />
      </div>
    );
  }
  return (
    <div
      className="item-state-icon"
      style={{ background: 'var(--border)', color: 'var(--grayLight)' }}
    >
      <Circle size={10} />
    </div>
  );
};

/**
 * Caja de comentario + adjunto.
 * El adjunto es un PLACEHOLDER no funcional: se ve el recuadro, pero no hay
 * input de archivo ni forma de subir nada. Solo el texto se guarda y lo ve el
 * admin en Resultados.
 */
const CajaComentario: React.FC<{
  etiqueta: string;
  placeholder: string;
  valor: string;
  tono: 'rojo' | 'naranja';
  soloLectura: boolean;
  onChange: (valor: string) => void;
}> = ({ etiqueta, placeholder, valor, tono, soloLectura, onChange }) => (
  <div className={`item-comment-box ${tono === 'rojo' ? 'tone-rojo' : ''}`}>
    <div>
      <label className="block text-[11px] font-bold text-[var(--gray)] mb-[6px]">
        {etiqueta} {!soloLectura && <span className="req-star">*</span>}
      </label>
      <textarea
        placeholder={soloLectura ? 'Sin comentario' : placeholder}
        value={valor}
        readOnly={soloLectura}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
    <div className="file-btn" title="Adjuntar evidencia estará disponible más adelante">
      <Paperclip size={14} />
      <span>Adjuntar captura</span>
    </div>
  </div>
);

/**
 * Tarjeta de un caso de prueba con las dos preguntas.
 *
 * Combinaciones y qué despliega cada una:
 *   funciona    + sigue igual → nada más, ahí termina
 *   funciona    + sí cambió   → 1 caja: "Cuéntanos qué pasó"
 *   no funciona + sigue igual → 1 caja: "¿Qué no funciona?"
 *   no funciona + sí cambió   → 2 cajas, una por pregunta
 */
export const ItemCard: React.FC<ItemCardProps> = ({
  caso,
  numero,
  soloLectura = false,
  onEstado,
  onCambio,
  onComentario,
}) => {
  const pide = camposPedidos(caso);
  const noFunciona = caso.estado === 'rechazado';

  return (
    <div className="item-card">
      <div className="item-card-top">
        <span className="item-num">{numero}</span>
        <div className="flex-1 min-w-0">
          <div className="item-name">{caso.nombre}</div>
          {caso.clasificador && (
            <div className="text-[11px] text-[var(--grayLight)] mt-[3px]">
              {caso.clasificador}
            </div>
          )}
        </div>
        <IconoEstado estado={caso.estado} />
      </div>

      {/* Pregunta 1 */}
      <div className="eval-block">
        <div className="eval-block-label">¿Funciona correctamente en este ambiente?</div>
        <div className="eval-choice-row">
          <button
            className={`eval-choice ${caso.estado === 'aprobado' ? 'on-teal' : ''}`}
            disabled={soloLectura}
            onClick={() => onEstado('aprobado')}
          >
            <Check size={14} />
            Sí, funciona
          </button>
          <button
            className={`eval-choice ${noFunciona ? 'on-rojo' : ''}`}
            disabled={soloLectura}
            onClick={() => onEstado('rechazado')}
          >
            <X size={14} />
            No funciona
          </button>
        </div>
      </div>

      {/* Pregunta 2 */}
      <div className="eval-block">
        <div className="eval-block-label">¿Notaste cambios frente a la versión anterior?</div>
        <div className="eval-choice-row">
          <button
            className={`eval-choice ${caso.cambio === false ? 'on-neutral' : ''}`}
            disabled={soloLectura}
            onClick={() => onCambio(false)}
          >
            No, sigue igual
          </button>
          <button
            className={`eval-choice ${caso.cambio === true ? 'on-naranja' : ''}`}
            disabled={soloLectura}
            onClick={() => onCambio(true)}
          >
            Sí, cambió
          </button>
        </div>
      </div>

      {/* Una caja por pregunta que lo pida — pueden salir las dos a la vez */}
      {pide.falla && (
        <CajaComentario
          etiqueta="¿Qué no funciona?"
          placeholder="Describe qué no funcionó..."
          valor={caso.comentarioFalla ?? ''}
          tono="rojo"
          soloLectura={soloLectura}
          onChange={(v) => onComentario('comentarioFalla', v)}
        />
      )}
      {pide.cambio && (
        <CajaComentario
          etiqueta={noFunciona ? '¿Qué cambió?' : 'Cuéntanos qué pasó'}
          placeholder={
            noFunciona
              ? 'Describe qué cambió respecto a la versión anterior...'
              : 'Describe qué es distinto respecto a la versión anterior...'
          }
          valor={caso.comentarioCambio ?? ''}
          tono="naranja"
          soloLectura={soloLectura}
          onChange={(v) => onComentario('comentarioCambio', v)}
        />
      )}
    </div>
  );
};

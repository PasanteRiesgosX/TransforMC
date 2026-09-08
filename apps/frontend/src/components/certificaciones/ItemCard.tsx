import React from 'react';
import { Check, X, Paperclip, Circle, GitBranch } from 'lucide-react';
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
  /** `'pendiente'` deselecciona la pregunta 1 (la deja sin respuesta). */
  onEstado: (estado: EstadoCaso) => void;
  /** `null` deselecciona la pregunta 2 (la deja sin respuesta). */
  onCambio: (cambio: boolean | null) => void;
  onComentario: (campo: 'comentarioFalla' | 'comentarioCambio', valor: string) => void;
  /** Dispara la creación de una nueva versión */
  onVersionar?: () => void;
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
  onVersionar,
}) => {
  const pide = camposPedidos(caso);
  const noFunciona = caso.estado === 'rechazado';
  const esVersionado = caso.version > 1;

  const puedeVersionar = !soloLectura && caso.estado !== 'pendiente' && onVersionar && caso.version < 6;

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Tarjeta principal (versión activa) */}
      <div className={`item-card ${esVersionado ? 'border-l-4 border-l-[var(--teal)]' : ''}`}>
        <div className="item-card-top items-start">
          <span className="item-num">{numero}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="item-name">{caso.nombre}</div>
              {esVersionado && (
                <span className="text-[10px] font-bold text-[var(--teal)] bg-[#e6f4f1] px-2 py-0.5 rounded-full">
                  v{caso.version}.0
                </span>
              )}
            </div>
            {caso.clasificador && (
              <div className="text-[11px] text-[var(--grayLight)] mt-[3px]">
                {caso.clasificador}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {puedeVersionar && (
              <button
                onClick={onVersionar}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--teal)] hover:bg-[#e6f4f1] px-2 py-1 rounded transition-colors"
                title="Crear una nueva versión de este caso de prueba"
              >
                <GitBranch size={13} />
                Versionar
              </button>
            )}
            <IconoEstado estado={caso.estado} />
          </div>
        </div>

      {/* Pregunta 1 */}
      <div className="eval-block">
        <div className="eval-block-label">¿Funciona correctamente en este ambiente?</div>
        <div className="eval-choice-row">
          <button
            className={`eval-choice ${caso.estado === 'aprobado' ? 'on-teal' : ''}`}
            disabled={soloLectura}
            onClick={() => onEstado(caso.estado === 'aprobado' ? 'pendiente' : 'aprobado')}
          >
            <Check size={14} />
            Sí, funciona
          </button>
          <button
            className={`eval-choice ${noFunciona ? 'on-rojo' : ''}`}
            disabled={soloLectura}
            onClick={() => onEstado(noFunciona ? 'pendiente' : 'rechazado')}
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
            className={`eval-choice ${caso.cambio === false ? 'on-cian' : ''}`}
            disabled={soloLectura}
            onClick={() => onCambio(caso.cambio === false ? null : false)}
          >
            No, sigue igual
          </button>
          <button
            className={`eval-choice ${caso.cambio === true ? 'on-naranja' : ''}`}
            disabled={soloLectura}
            onClick={() => onCambio(caso.cambio === true ? null : true)}
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

    {/* Versiones Históricas */}
      {caso.versionesAnteriores?.map((hist) => {
        const hPideFalla = hist.estado === 'rechazado';
        const hPideCambio = hist.cambio === true;
        
        return (
          <div key={hist.version} className="item-card opacity-70 ml-8 border-l-4 border-l-[var(--grayLight)]">
            <div className="item-card-top items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="item-name text-[var(--gray)]">{caso.nombre}</div>
                  <span className="text-[10px] font-bold text-[var(--gray)] bg-[var(--grayLight)] bg-opacity-20 px-2 py-0.5 rounded-full">
                    v{hist.version}.0
                  </span>
                </div>
              </div>
              <IconoEstado estado={hist.estado} />
            </div>

            <div className="eval-block">
              <div className="eval-block-label">¿Funciona correctamente en este ambiente?</div>
              <div className="eval-choice-row">
                <button className={`eval-choice ${hist.estado === 'aprobado' ? 'on-teal' : ''}`} disabled>
                  <Check size={14} />
                  Sí, funciona
                </button>
                <button className={`eval-choice ${hPideFalla ? 'on-rojo' : ''}`} disabled>
                  <X size={14} />
                  No funciona
                </button>
              </div>
            </div>

            <div className="eval-block">
              <div className="eval-block-label">¿Notaste cambios frente a la versión anterior?</div>
              <div className="eval-choice-row">
                <button className={`eval-choice ${hist.cambio === false ? 'on-cian' : ''}`} disabled>
                  No, sigue igual
                </button>
                <button className={`eval-choice ${hist.cambio === true ? 'on-naranja' : ''}`} disabled>
                  Sí, cambió
                </button>
              </div>
            </div>

            {hPideFalla && (
              <CajaComentario
                etiqueta="¿Qué no funciona?"
                placeholder=""
                valor={hist.comentarioFalla ?? ''}
                tono="rojo"
                soloLectura={true}
                onChange={() => {}}
              />
            )}
            {hPideCambio && (
              <CajaComentario
                etiqueta={hPideFalla ? '¿Qué cambió?' : 'Cuéntanos qué pasó'}
                placeholder=""
                valor={hist.comentarioCambio ?? ''}
                tono="naranja"
                soloLectura={true}
                onChange={() => {}}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

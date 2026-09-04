import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, FlaskConical, Rocket, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { CircularProgress } from '../components/certificaciones/CircularProgress';
import { API, authHeaders, readError, type EsquemaAsignado } from '../lib/certificaciones';

/**
 * NIVEL 0 — "Mis certificaciones".
 * Solo los esquemas donde el admin asignó a este usuario como responsable de al
 * menos un caso de prueba. El backend resuelve todo contra el token.
 */
export const CertifierSchemes: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [esquemas, setEsquemas] = useState<EsquemaAsignado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEsquemas = async () => {
      try {
        const res = await axios.get(`${API}/api/mis-certificaciones`, authHeaders());
        setEsquemas(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar tus certificaciones'));
      } finally {
        setLoading(false);
      }
    };
    fetchEsquemas();
  }, [showToast]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando tus certificaciones...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1 className="page-title">Mis certificaciones</h1>
        <p className="page-sub">
          {esquemas.length
            ? 'Elige en qué certificación quieres trabajar. Tus respuestas se guardan solas.'
            : 'Todavía no tienes nada asignado.'}
        </p>
      </div>

      {esquemas.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="es-icon flex justify-center">
              <ClipboardList size={32} />
            </div>
            <div className="es-title">Por ahora no tienes certificaciones pendientes</div>
            En cuanto el administrador te asigne un paquete, lo vas a ver aquí.
          </div>
        </div>
      ) : (
        <div
          className="grid gap-[14px]"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
        >
          {esquemas.map((sch) => {
            const isProd = sch.ambiente === 'Producción';
            const EnvIcon = isProd ? Rocket : FlaskConical;
            const { progreso: p, envio } = sch;
            const enviado = envio.enviado;
            const anillo = enviado ? 'var(--teal)' : p.pct === 100 ? 'var(--naranjaFuerte)' : 'var(--cian)';

            return (
              <div key={sch.id} className="campaign-card">
                <div className="campaign-card-top">
                  <div className="campaign-ring-wrap">
                    <CircularProgress pct={p.pct} size={64} color={anillo} />
                    <div className="campaign-ring-pct">{p.pct}%</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="campaign-title">{sch.nombre}</div>
                    <div className="campaign-meta">
                      <EnvIcon size={13} />
                      {sch.ambiente} · {p.total} caso{p.total !== 1 ? 's' : ''} asignado
                      {p.total !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className={`tag ${isProd ? 'tag-magenta' : 'tag-cian'}`}>
                    {sch.ambiente}
                  </span>
                </div>

                <div className="campaign-stats">
                  {/* Distintivo de esquema ya enviado — la tarjeta sigue visible */}
                  {enviado && (
                    <span className="tag tag-teal">
                      <Check size={12} />
                      COMPLETADO
                    </span>
                  )}
                  <span className="tag tag-teal">{p.ok} bien</span>
                  <span className={`tag ${p.fail > 0 ? 'tag-rojo' : 'tag-neutral'}`}>
                    {p.fail} con fallas
                  </span>
                  {!enviado && <span className="tag tag-neutral">{p.pendientes} pendientes</span>}
                </div>

                {enviado && envio.enviadoEn && (
                  <div className="text-[11px] text-[var(--grayLight)] -mt-[8px]">
                    Enviado el {new Date(envio.enviadoEn).toLocaleString('es-EC')}
                  </div>
                )}

                <button
                  className={`btn ${enviado ? 'btn-outline' : 'btn-primary'} campaign-cta`}
                  onClick={() => navigate(`/certificador/esquemas/${sch.id}`)}
                >
                  {enviado
                    ? 'Ver mis respuestas'
                    : p.done > 0
                      ? 'Continuar certificando'
                      : 'Empezar a certificar'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

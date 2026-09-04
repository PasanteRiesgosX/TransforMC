import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronRight,
  Layers,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Paperclip,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { StatCards } from '../components/resultados/StatCards';
import { ResultsHeader } from '../components/resultados/ResultsHeader';
import {
  API,
  authHeaders,
  ESTADO_LABEL,
  ESTADO_TAG,
  nombreCompleto,
  readError,
  type EstadoCaso,
  type Metricas,
  type Responsable,
} from '../lib/resultados';

interface CasoResultado {
  paqueteItemId: string;
  casoPruebaId: string;
  nombre: string;
  clasificador: string | null;
  paquete: { id: string; nombre: string };
  estado: EstadoCaso;
  cambio: boolean;
  /** "¿Qué no funciona?" — solo cuando el caso fue rechazado. */
  comentarioFalla: string | null;
  /** "¿Qué cambió?" / "Cuéntanos qué pasó" — solo cuando hubo cambios. */
  comentarioCambio: string | null;
  certificadoPor: Responsable | null;
  certificadoEn: string | null;
  responsables: Responsable[];
}

interface SubModuloDetalle {
  esquema: { id: string; nombre: string; ambiente: string };
  modulo: { id: string; nombre: string };
  subModulo: { id: string; nombre: string };
  metricas: Metricas;
  responsablesDisponibles: Responsable[];
  casos: CasoResultado[];
}

const ICONO_ESTADO: Record<EstadoCaso, { Icon: typeof CheckCircle2; color: string }> = {
  aprobado: { Icon: CheckCircle2, color: 'var(--teal)' },
  rechazado: { Icon: XCircle, color: 'var(--rojo)' },
  pendiente: { Icon: Clock, color: 'var(--grayLight)' },
};

/**
 * NIVEL 3 — la tabla. Solo los casos de prueba que el admin seleccionó al armar
 * el esquema, nunca el submódulo completo del catálogo.
 *
 * Los filtros viven en la query string para que la vista filtrada sea
 * compartible, y NO alteran los 4 KPI de arriba: filtrar es mirar un
 * subconjunto, no cambiar la medición del submódulo.
 */
export const AdminResultsSubModule: React.FC = () => {
  const { esquemaId, subModuloId } = useParams<{ esquemaId: string; subModuloId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<SubModuloDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  const filtroResponsable = searchParams.get('responsable') ?? '';
  const filtroEstado = searchParams.get('estado') ?? '';

  useEffect(() => {
    const fetchDetalle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/resultados/esquemas/${esquemaId}/submodulos/${subModuloId}`,
          authHeaders(),
        );
        setData(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar el submódulo'));
        navigate(`/admin/resultados/${esquemaId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [esquemaId, subModuloId, navigate, showToast]);

  const casosFiltrados = useMemo(() => {
    if (!data) return [];
    return data.casos.filter((c) => {
      if (filtroEstado && c.estado !== filtroEstado) return false;
      if (filtroResponsable && !c.responsables.some((r) => r.id === filtroResponsable))
        return false;
      return true;
    });
  }, [data, filtroEstado, filtroResponsable]);

  const setFiltro = (clave: string, valor: string) => {
    const next = new URLSearchParams(searchParams);
    if (valor) next.set(clave, valor);
    else next.delete(clave);
    setSearchParams(next, { replace: true });
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando resultados...</div>;
  }
  if (!data) return null;

  const { esquema, modulo, subModulo, metricas, responsablesDisponibles } = data;
  const hayFiltros = Boolean(filtroEstado || filtroResponsable);

  return (
    <div className="fade-in">
      <div className="breadcrumbs">
        <Link to="/admin/resultados">Resultados</Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link to={`/admin/resultados/${esquema.id}`}>{esquema.nombre}</Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link to={`/admin/resultados/${esquema.id}/modulos/${modulo.id}`}>{modulo.nombre}</Link>
        <ChevronRight size={12} className="opacity-50" />
        <span className="current">{subModulo.nombre}</span>
      </div>

      <ResultsHeader
        id={subModulo.id}
        icon={<Layers size={19} />}
        title={subModulo.nombre}
        subtitle={
          <>
            {modulo.nombre} · {metricas.total} caso{metricas.total !== 1 ? 's' : ''} de prueba en
            este esquema
          </>
        }
        metricas={metricas}
      />

      <StatCards metricas={metricas} labelAvance="Avance del submódulo" />

      {/* Filtros — no alteran los KPI de arriba */}
      <div className="toolbar items-end">
        <div className="flex items-center gap-[6px] text-[13px] font-bold text-[var(--navy)]">
          <Filter size={14} />
          Filtrar casos de prueba
        </div>
        <div className="toolbar-right items-end">
          <div className="field mb-0 min-w-[200px]">
            <label>Responsable</label>
            <select
              value={filtroResponsable}
              onChange={(e) => setFiltro('responsable', e.target.value)}
            >
              <option value="">Todos los responsables</option>
              {responsablesDisponibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {nombreCompleto(r)}
                </option>
              ))}
            </select>
          </div>
          <div className="field mb-0 min-w-[180px]">
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltro('estado', e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="aprobado">Funciona</option>
              <option value="rechazado">No funciona</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        {casosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="es-title">Ningún caso de prueba coincide con los filtros</div>
            Ajusta el responsable o el estado para volver a ver resultados.
            {hayFiltros && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Caso de Prueba</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Cambios</th>
                <th>Comentario</th>
                <th>Documento Adjunto</th>
              </tr>
            </thead>
            <tbody>
              {casosFiltrados.map((caso) => {
                const { Icon, color } = ICONO_ESTADO[caso.estado];
                return (
                  <tr key={caso.paqueteItemId} className="row-hover">
                    <td>
                      <div className="font-bold text-[var(--navy)] text-[13px]">{caso.nombre}</div>
                      {caso.clasificador && (
                        <div className="text-[11px] text-[var(--grayLight)] mt-[2px]">
                          {caso.clasificador}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`tag ${ESTADO_TAG[caso.estado]}`}>
                        <Icon size={14} style={{ color }} />
                        {ESTADO_LABEL[caso.estado]}
                      </span>
                    </td>
                    <td>
                      {caso.responsables.length === 0 ? (
                        <span className="text-[var(--grayLight)]">—</span>
                      ) : (
                        <div className="flex flex-col gap-[6px]">
                          {caso.responsables.map((r) => (
                            <div key={r.id} className="flex items-center gap-2">
                              <Avatar
                                name={r.nombre}
                                lastName={r.apellido}
                                size="sm"
                                className="!w-[22px] !h-[22px] !text-[9px]"
                              />
                              <span className="text-[12.5px]">{nombreCompleto(r)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      {caso.cambio ? (
                        <span className="tag tag-naranja">Con cambios</span>
                      ) : (
                        <span className="text-[var(--grayLight)]">—</span>
                      )}
                    </td>
                    {/* Los dos comentarios del certificador, etiquetados por su pregunta */}
                    <td>
                      {caso.comentarioFalla || caso.comentarioCambio ? (
                        <div className="flex flex-col gap-[6px] max-w-[280px]">
                          {caso.comentarioFalla && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-[0.02em] text-[var(--rojo)]">
                                Qué no funciona
                              </span>
                              <span
                                className="block text-[12.5px] text-[var(--grayLight)] truncate"
                                title={caso.comentarioFalla}
                              >
                                {caso.comentarioFalla}
                              </span>
                            </div>
                          )}
                          {caso.comentarioCambio && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-[0.02em] text-[#B87200]">
                                Qué cambió
                              </span>
                              <span
                                className="block text-[12.5px] text-[var(--grayLight)] truncate"
                                title={caso.comentarioCambio}
                              >
                                {caso.comentarioCambio}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--grayLight)]">—</span>
                      )}
                    </td>
                    {/* Placeholder no funcional: la evidencia adjunta llega en la Fase 5 */}
                    <td>
                      <span className="inline-flex items-center gap-[6px] text-[var(--grayLight)] opacity-50">
                        <Paperclip size={14} />—
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

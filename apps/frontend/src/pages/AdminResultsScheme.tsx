import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, FlaskConical, Rocket, ClipboardCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getModuleIcon } from './AdminCatalog';
import { StatCards } from '../components/resultados/StatCards';
import { ResultCard } from '../components/resultados/ResultCard';
import { ResultsHeader } from '../components/resultados/ResultsHeader';
import {
  API,
  authHeaders,
  readError,
  type Metricas,
} from '../lib/resultados';

interface ModuloResultado {
  id: string;
  nombre: string;
  subModulosCount: number;
  metricas: Metricas;
}

interface EsquemaDetalle {
  esquema: { id: string; nombre: string; ambiente: string; creadoEn: string };
  metricas: Metricas;
  modulos: ModuloResultado[];
}

/**
 * NIVEL 1 — módulos que participan en el esquema.
 * La jerarquía se respeta siempre: aunque el admin haya seleccionado submódulos
 * o casos de prueba sueltos, este nivel muestra los MÓDULOS a los que pertenecen.
 */
export const AdminResultsScheme: React.FC = () => {
  const { esquemaId } = useParams<{ esquemaId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<EsquemaDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/resultados/esquemas/${esquemaId}`,
          authHeaders(),
        );
        setData(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar el esquema'));
        navigate('/admin/resultados');
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [esquemaId, navigate, showToast]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando resultados...</div>;
  }
  if (!data) return null;

  const { esquema, metricas, modulos } = data;
  const isProd = esquema.ambiente === 'Producción';
  const EnvIcon = isProd ? Rocket : FlaskConical;

  return (
    <div className="fade-in">
      <div className="breadcrumbs">
        <Link to="/admin/resultados">Resultados</Link>
        <ChevronRight size={12} className="opacity-50" />
        <span className="current">{esquema.nombre}</span>
      </div>

      <ResultsHeader
        id={esquema.id}
        icon={<EnvIcon size={19} />}
        title={esquema.nombre}
        subtitle={
          <>
            {modulos.length} módulo{modulos.length !== 1 ? 's' : ''} · {metricas.total} ítem
            {metricas.total !== 1 ? 's' : ''} en este esquema
          </>
        }
        badge={
          <span className={`tag ${isProd ? 'tag-magenta' : 'tag-cian'}`}>{esquema.ambiente}</span>
        }
        metricas={metricas}
      />

      <StatCards metricas={metricas} labelAvance="Avance del esquema" />

      <div className="toolbar">
        <p className="font-bold text-[13px] text-[var(--navy)] m-0">
          Módulos incluidos en este esquema
        </p>
      </div>

      {modulos.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="es-icon flex justify-center">
              <ClipboardCheck size={32} />
            </div>
            <div className="es-title">Este esquema no tiene ítems asignados</div>
            Edita el esquema y agrega al menos un paquete con casos de prueba.
          </div>
        </div>
      ) : (
        <div
          className="grid gap-[14px]"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {modulos.map((mod) => {
            const Icon = getModuleIcon(mod.nombre);
            return (
              <ResultCard
                key={mod.id}
                id={mod.id}
                icon={<Icon size={19} />}
                title={mod.nombre}
                meta={
                  <>
                    {mod.subModulosCount} submódulo{mod.subModulosCount !== 1 ? 's' : ''} ·{' '}
                    {mod.metricas.total} ítem{mod.metricas.total !== 1 ? 's' : ''} en este esquema
                  </>
                }
                metricas={mod.metricas}
                onClick={() => navigate(`/admin/resultados/${esquema.id}/modulos/${mod.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

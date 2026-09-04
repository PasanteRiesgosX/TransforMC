import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Layers } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getModuleIcon } from './AdminCatalog';
import { StatCards } from '../components/resultados/StatCards';
import { ResultCard } from '../components/resultados/ResultCard';
import { ResultsHeader } from '../components/resultados/ResultsHeader';
import {
  API,
  authHeaders,
  nombreCompleto,
  readError,
  type Metricas,
  type Responsable,
} from '../lib/resultados';

interface SubModuloResultado {
  id: string;
  nombre: string;
  responsables: Responsable[];
  metricas: Metricas;
}

interface ModuloDetalle {
  esquema: { id: string; nombre: string; ambiente: string };
  modulo: { id: string; nombre: string };
  metricas: Metricas;
  subModulos: SubModuloResultado[];
}

/**
 * NIVEL 2 — submódulos de ese módulo DENTRO de este esquema.
 * Solo aparecen los submódulos que el admin seleccionó; nunca el módulo completo
 * del catálogo.
 */
export const AdminResultsModule: React.FC = () => {
  const { esquemaId, moduloId } = useParams<{ esquemaId: string; moduloId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<ModuloDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/resultados/esquemas/${esquemaId}/modulos/${moduloId}`,
          authHeaders(),
        );
        setData(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar el módulo'));
        navigate(`/admin/resultados/${esquemaId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [esquemaId, moduloId, navigate, showToast]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando resultados...</div>;
  }
  if (!data) return null;

  const { esquema, modulo, metricas, subModulos } = data;
  const Icon = getModuleIcon(modulo.nombre);

  return (
    <div className="fade-in">
      <div className="breadcrumbs">
        <Link to="/admin/resultados">Resultados</Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link to={`/admin/resultados/${esquema.id}`}>{esquema.nombre}</Link>
        <ChevronRight size={12} className="opacity-50" />
        <span className="current">{modulo.nombre}</span>
      </div>

      <ResultsHeader
        id={modulo.id}
        icon={<Icon size={19} />}
        title={modulo.nombre}
        subtitle={
          <>
            {subModulos.length} submódulo{subModulos.length !== 1 ? 's' : ''} · {metricas.total}{' '}
            ítem{metricas.total !== 1 ? 's' : ''} en este esquema
          </>
        }
        metricas={metricas}
      />

      <StatCards metricas={metricas} labelAvance="Avance del módulo" />

      <div className="toolbar">
        <p className="font-bold text-[13px] text-[var(--navy)] m-0">
          SubMódulos incluidos en este esquema
        </p>
      </div>

      <div
        className="grid gap-[14px]"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
      >
        {subModulos.map((sub) => (
          <ResultCard
            key={sub.id}
            id={sub.id}
            icon={<Layers size={19} />}
            title={sub.nombre}
            meta={
              <>
                {sub.metricas.total} ítem{sub.metricas.total !== 1 ? 's' : ''} ·{' '}
                {sub.responsables.length
                  ? sub.responsables.map(nombreCompleto).join(', ')
                  : 'Sin responsable asignado'}
              </>
            }
            metricas={sub.metricas}
            onClick={() =>
              navigate(`/admin/resultados/${esquema.id}/submodulos/${sub.id}`)
            }
          />
        ))}
      </div>
    </div>
  );
};

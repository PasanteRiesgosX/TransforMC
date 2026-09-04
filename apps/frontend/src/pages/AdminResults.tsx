import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, FlaskConical, Rocket } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { StatCards } from '../components/resultados/StatCards';
import { ResultCard } from '../components/resultados/ResultCard';
import {
  API,
  authHeaders,
  colors,
  getHashIndex,
  readError,
  METRICAS_VACIAS,
  type Metricas,
  type Responsable,
} from '../lib/resultados';

interface EsquemaResultado {
  id: string;
  nombre: string;
  ambiente: string;
  creadoEn: string;
  responsables: Responsable[];
  _count: { paquetes: number; items: number };
  metricas: Metricas;
}

interface Overview {
  totales: Metricas;
  esquemas: EsquemaResultado[];
}

/**
 * NIVEL 0 — Vista global.
 * Los esquemas son entornos de testeo AISLADOS: al entrar a Resultados no se ven
 * resultados sueltos mezclados, se ve la lista de esquemas. Los 4 KPI de arriba
 * son el acumulado de todos, etiquetado como tal.
 */
export const AdminResults: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axios.get(`${API}/api/resultados/overview`, authHeaders());
        setData(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar los resultados'));
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [showToast]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando resultados...</div>;
  }

  const esquemas = data?.esquemas ?? [];
  const totales = data?.totales ?? METRICAS_VACIAS;
  const q = query.trim().toLowerCase();
  const visibles = q
    ? esquemas.filter((e) => e.nombre.toLowerCase().includes(q))
    : esquemas;

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1 className="page-title">Resultados</h1>
        <p className="page-sub">
          Cada esquema de evaluación es un testeo independiente. Entra en uno para ver su avance
          por módulo, submódulo y caso de prueba.
        </p>
      </div>

      {esquemas.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="es-icon flex justify-center">
              <BarChart3 size={32} />
            </div>
            <div className="es-title">Todavía no hay nada que mostrar</div>
            Crea un esquema de evaluación y asigna responsables para empezar a ver resultados aquí.
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => navigate('/admin/esquemas')}>
                Ir a Esquemas
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <StatCards metricas={totales} labelAvance="Avance acumulado" />

          <div className="toolbar">
            <p className="font-bold text-[13px] text-[var(--navy)] m-0">
              Por esquema de evaluación
            </p>
          </div>

          <div className="search-wrap">
            <input
              placeholder="Buscar esquema..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {visibles.length === 0 ? (
            <div className="panel">
              <div className="empty-state">
                <div className="es-title">Sin resultados para "{query}"</div>
                Prueba con otro nombre de esquema.
              </div>
            </div>
          ) : (
            <div
              className="grid gap-[14px]"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
              {visibles.map((sch) => {
                const isProd = sch.ambiente === 'Producción';
                const EnvIcon = isProd ? Rocket : FlaskConical;
                const mostrados = sch.responsables.slice(0, 4);
                const extra = sch.responsables.length - mostrados.length;

                return (
                  <ResultCard
                    key={sch.id}
                    id={sch.id}
                    icon={<EnvIcon size={19} />}
                    title={sch.nombre}
                    meta={
                      <>
                        {sch._count.paquetes} paquete{sch._count.paquetes !== 1 ? 's' : ''} ·{' '}
                        {sch._count.items} ítem{sch._count.items !== 1 ? 's' : ''} · creado{' '}
                        {new Date(sch.creadoEn).toLocaleDateString('es-EC')}
                      </>
                    }
                    badge={
                      <span className={`tag ${isProd ? 'tag-magenta' : 'tag-cian'}`}>
                        {sch.ambiente}
                      </span>
                    }
                    metricas={sch.metricas}
                    onClick={() => navigate(`/admin/resultados/${sch.id}`)}
                  >
                    <div className="flex items-center gap-[6px] mt-3 min-h-[30px]">
                      {mostrados.map((u) => (
                        <div
                          key={u.id}
                          className={`avatar bg-${colors[getHashIndex(u.id, colors.length)]}`}
                          title={`${u.nombre} ${u.apellido}`}
                        >
                          {(u.nombre[0] + u.apellido[0]).toUpperCase()}
                        </div>
                      ))}
                      {extra > 0 && <div className="avatar bg-morado">+{extra}</div>}
                      {sch.responsables.length === 0 && (
                        <span className="text-[11.5px] text-[var(--grayLight)]">
                          Sin responsables aún
                        </span>
                      )}
                    </div>
                  </ResultCard>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

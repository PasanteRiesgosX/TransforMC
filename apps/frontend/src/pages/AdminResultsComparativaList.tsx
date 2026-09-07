import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, Rocket } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  API,
  authHeaders,
  readError,
} from '../lib/resultados';

export const AdminResultsComparativaList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pairs, setPairs] = useState<{ pruebas: any; prod: any }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axios.get(`${API}/api/resultados/overview`, authHeaders());
        const esquemas = res.data.esquemas;
        
        const linkedPairs: { pruebas: any; prod: any }[] = [];
        esquemas.forEach((sch: any) => {
          if (sch.esquemaPadreId) {
            const parent = esquemas.find((s: any) => s.id === sch.esquemaPadreId);
            if (parent) {
              linkedPairs.push({ pruebas: parent, prod: sch });
            }
          }
        });
        
        setPairs(linkedPairs);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar los resultados'));
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [showToast]);

  return (
    <div className="fade-in">
      <div className="breadcrumbs">
        <a onClick={() => navigate('/admin/resultados')} style={{ cursor: 'pointer' }}>
          Resultados
        </a>
        <span className="sep">/</span>
        <span className="current">Pruebas vs Producción</span>
      </div>

      <div className="page-head">
        <h1 className="page-title flex items-center gap-2">
          <Rocket className="text-[var(--magenta)]" size={24} />
          Comparativa Pruebas vs Producción
        </h1>
        <p className="page-sub">
          Selecciona un esquema para comparar los resultados de su entorno de Pruebas frente al de Producción.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[var(--grayLight)]">Cargando...</div>
      ) : pairs.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="es-icon flex justify-center">
              <BarChart3 size={32} />
            </div>
            <div className="es-title">Todavía no hay comparativas</div>
            No hay esquemas de Producción vinculados a esquemas de Pruebas.
          </div>
        </div>
      ) : (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {pairs.map(({ pruebas, prod }) => (
            <div 
              key={prod.id} 
              className="mod-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/admin/resultados/comparativa/${pruebas.id}/${prod.id}`)}
            >
              <div className="font-bold text-[14px] text-[var(--navy)] mb-2">
                {pruebas.nombre}
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-[var(--cian-bg)] p-3 rounded-md">
                  <div className="text-[12px] font-bold text-[var(--cian)] mb-1">Pruebas</div>
                  <div className="text-[18px] font-bold">
                    {pruebas.metricas?.calidad !== null ? `${pruebas.metricas.calidad}%` : 'N/A'}
                  </div>
                  <div className="text-[11px] text-gray-500">calidad</div>
                </div>
                <div className="flex-1 bg-[var(--amarillo-bg)] p-3 rounded-md">
                  <div className="text-[12px] font-bold text-[var(--amarillo)] mb-1">Producción</div>
                  <div className="text-[18px] font-bold">
                    {prod.metricas?.calidad !== null ? `${prod.metricas.calidad}%` : 'N/A'}
                  </div>
                  <div className="text-[11px] text-gray-500">calidad</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

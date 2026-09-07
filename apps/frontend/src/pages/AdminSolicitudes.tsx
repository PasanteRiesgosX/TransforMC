import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API, authHeaders, readError } from '../lib/resultados';

interface EsquemaConSolicitudes {
  id: string;
  nombre: string;
  ambiente: string;
  pendientesCount: number;
  totalCount: number;
}

export const AdminSolicitudes: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [esquemas, setEsquemas] = useState<EsquemaConSolicitudes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const res = await axios.get(`${API}/api/solicitudes`, authHeaders());
        setEsquemas(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar las solicitudes'));
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, [showToast]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando solicitudes...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1 className="page-title flex items-center gap-2">
          <FileText className="text-[var(--naranja)]" size={24} />
          Solicitudes de reapertura
        </h1>
        <p className="page-sub">
          Administra las solicitudes de los certificadores para reabrir esquemas de evaluación ya enviados.
        </p>
      </div>

      {esquemas.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="es-icon flex justify-center">
              <FileText size={32} />
            </div>
            <div className="es-title">No hay solicitudes</div>
            Ningún certificador ha solicitado reabrir su evaluación.
          </div>
        </div>
      ) : (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {esquemas.map((sch) => {
            return (
              <div
                key={sch.id}
                className="mod-card group cursor-pointer relative"
                onClick={() => navigate(`/admin/solicitudes/${sch.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className={`tag ${sch.ambiente === 'Producción' ? 'tag-magenta' : 'tag-cian'} mb-2`}>
                    {sch.ambiente}
                  </div>
                  {sch.pendientesCount > 0 && (
                    <div className="bg-[var(--rojo)] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {sch.pendientesCount} pendiente{sch.pendientesCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                <div className="font-bold text-[15px] text-[var(--navy)] mb-1">{sch.nombre}</div>
                <div className="text-[12px] text-[var(--gray)]">
                  Total de solicitudes: {sch.totalCount}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

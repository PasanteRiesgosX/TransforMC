import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Rocket, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  API,
  authHeaders,
  readError,
  ESTADO_TAG,
  ESTADO_LABEL,
} from '../lib/resultados';

type ViewMode = 'modulos' | 'submodulos' | 'casos';

export const AdminResultsComparativaDetail: React.FC = () => {
  const { pruebasId, prodId } = useParams<{ pruebasId: string; prodId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>('modulos');
  
  // Breadcrumbs state
  const [esquemaPruebas, setEsquemaPruebas] = useState<any>(null);
  const [selectedModulo, setSelectedModulo] = useState<{ id: string; nombre: string } | null>(null);
  const [selectedSubModulo, setSelectedSubModulo] = useState<{ id: string; nombre: string } | null>(null);

  // Data state
  const [modulos, setModulos] = useState<any[]>([]);
  const [subModulos, setSubModulos] = useState<any[]>([]);
  const [casos, setCasos] = useState<any[]>([]);

  useEffect(() => {
    // Carga inicial: cargar los esquemas y sus modulos
    const fetchModulos = async () => {
      setLoading(true);
      try {
        const [resPruebas, resProd] = await Promise.all([
          axios.get(`${API}/api/resultados/esquemas/${pruebasId}`, authHeaders()),
          axios.get(`${API}/api/resultados/esquemas/${prodId}`, authHeaders())
        ]);

        setEsquemaPruebas(resPruebas.data.esquema);

        const pMods = resPruebas.data.modulos || [];
        const prMods = resProd.data.modulos || [];

        const allIds = new Set([...pMods.map((m: any) => m.id), ...prMods.map((m: any) => m.id)]);
        const merged = Array.from(allIds).map(id => {
          const p = pMods.find((m: any) => m.id === id);
          const pr = prMods.find((m: any) => m.id === id);
          return {
            id,
            nombre: p?.nombre || pr?.nombre,
            pruebasPct: p?.metricas?.calidad ?? null,
            prodPct: pr?.metricas?.calidad ?? null,
          };
        });

        setModulos(merged);
        setView('modulos');
      } catch (err) {
        showToast(readError(err, 'Error al cargar esquemas de comparación'));
        navigate('/admin/resultados/comparativa');
      } finally {
        setLoading(false);
      }
    };
    fetchModulos();
  }, [pruebasId, prodId, navigate, showToast]);

  const loadSubModulos = async (moduloId: string, moduloNombre: string) => {
    setSelectedModulo({ id: moduloId, nombre: moduloNombre });
    setLoading(true);
    try {
      // Usar Promise.allSettled por si un mdulo no existe en uno de los esquemas (no seleccionado)
      const [resPruebas, resProd] = await Promise.allSettled([
        axios.get(`${API}/api/resultados/esquemas/${pruebasId}/modulos/${moduloId}`, authHeaders()),
        axios.get(`${API}/api/resultados/esquemas/${prodId}/modulos/${moduloId}`, authHeaders())
      ]);

      const pSubs = resPruebas.status === 'fulfilled' ? resPruebas.value.data.subModulos : [];
      const prSubs = resProd.status === 'fulfilled' ? resProd.value.data.subModulos : [];

      const allIds = new Set([...pSubs.map((s: any) => s.id), ...prSubs.map((s: any) => s.id)]);
      const merged = Array.from(allIds).map(id => {
        const p = pSubs.find((s: any) => s.id === id);
        const pr = prSubs.find((s: any) => s.id === id);
        return {
          id,
          nombre: p?.nombre || pr?.nombre,
          pruebasPct: p?.metricas?.calidad ?? null,
          prodPct: pr?.metricas?.calidad ?? null,
        };
      });

      setSubModulos(merged);
      setView('submodulos');
    } catch (err) {
      showToast('Error al cargar los submódulos');
    } finally {
      setLoading(false);
    }
  };

  const loadCasos = async (subModuloId: string, subModuloNombre: string) => {
    setSelectedSubModulo({ id: subModuloId, nombre: subModuloNombre });
    setLoading(true);
    try {
      const [resPruebas, resProd] = await Promise.allSettled([
        axios.get(`${API}/api/resultados/esquemas/${pruebasId}/submodulos/${subModuloId}`, authHeaders()),
        axios.get(`${API}/api/resultados/esquemas/${prodId}/submodulos/${subModuloId}`, authHeaders())
      ]);

      const pCasos = resPruebas.status === 'fulfilled' ? resPruebas.value.data.casos : [];
      const prCasos = resProd.status === 'fulfilled' ? resProd.value.data.casos : [];

      const allIds = new Set([...pCasos.map((c: any) => c.casoPruebaId), ...prCasos.map((c: any) => c.casoPruebaId)]);
      
      const merged = Array.from(allIds).map(id => {
        const p = pCasos.find((c: any) => c.casoPruebaId === id);
        const pr = prCasos.find((c: any) => c.casoPruebaId === id);
        return {
          id,
          nombre: p?.nombre || pr?.nombre,
          estadoPruebas: p?.estado ?? null,
          estadoProd: pr?.estado ?? null,
        };
      });

      setCasos(merged);
      setView('casos');
    } catch (err) {
      showToast('Error al cargar los casos de prueba');
    } finally {
      setLoading(false);
    }
  };

  if (!esquemaPruebas && loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando comparativa...</div>;
  }

  const renderPercentage = (pct: number | null) => {
    if (pct === null) return <span className="text-gray-400">Sin dato</span>;
    return <span>{pct}%</span>;
  };

  return (
    <div className="fade-in">
      <div className="breadcrumbs">
        <a onClick={() => navigate('/admin/resultados')} className="cursor-pointer hover:underline text-[var(--navy)]">Resultados</a>
        <ChevronRight size={12} className="opacity-50" />
        <a onClick={() => navigate('/admin/resultados/comparativa')} className="cursor-pointer hover:underline text-[var(--navy)]">Pruebas vs Producción</a>
        <ChevronRight size={12} className="opacity-50" />
        <a onClick={() => setView('modulos')} className={`cursor-pointer hover:underline ${view === 'modulos' ? 'current font-bold' : 'text-[var(--navy)]'}`}>
          {esquemaPruebas?.nombre}
        </a>
        
        {view !== 'modulos' && selectedModulo && (
          <>
            <ChevronRight size={12} className="opacity-50" />
            <a onClick={() => setView('submodulos')} className={`cursor-pointer hover:underline ${view === 'submodulos' ? 'current font-bold' : 'text-[var(--navy)]'}`}>
              {selectedModulo.nombre}
            </a>
          </>
        )}
        
        {view === 'casos' && selectedSubModulo && (
          <>
            <ChevronRight size={12} className="opacity-50" />
            <span className="current">{selectedSubModulo.nombre}</span>
          </>
        )}
      </div>

      <div className="page-head">
        <h1 className="page-title flex items-center gap-2">
          <Rocket className="text-[var(--magenta)]" size={24} />
          {view === 'modulos' ? 'Comparativa de Módulos' : view === 'submodulos' ? 'Comparativa de Submódulos' : 'Comparativa de Casos de Prueba'}
        </h1>
        <p className="page-sub">
          {view === 'modulos' ? 'Selecciona un módulo para ver sus submódulos.' : 
           view === 'submodulos' ? 'Selecciona un submódulo para ver los casos de prueba.' : 
           'Compara el estado de cada caso de prueba entre ambos entornos.'}
        </p>
      </div>

      {loading && view !== 'modulos' ? (
        <div className="p-8 text-center text-[var(--grayLight)]">Cargando...</div>
      ) : view === 'modulos' ? (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {modulos.map((m) => (
            <div 
              key={m.id} 
              className="mod-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => loadSubModulos(m.id, m.nombre)}
            >
              <div className="flex gap-2">
                <div className="flex-1 text-center bg-[var(--cian-bg)] p-3 rounded-l-md border-r border-white">
                  <div className="text-[12px] font-bold text-[var(--cian)] mb-1">Pruebas</div>
                  <div className="text-[20px] font-bold text-[var(--navy)]">
                    {renderPercentage(m.pruebasPct)}
                  </div>
                </div>
                <div className="flex-1 text-center bg-[var(--amarillo-bg)] p-3 rounded-r-md">
                  <div className="text-[12px] font-bold text-[var(--amarillo)] mb-1">Producción</div>
                  <div className="text-[20px] font-bold text-[var(--navy)]">
                    {renderPercentage(m.prodPct)}
                  </div>
                </div>
              </div>
              <div className="mt-3 font-bold text-[14px] text-[var(--navy)] text-center">
                {m.nombre}
              </div>
            </div>
          ))}
          {modulos.length === 0 && (
            <div className="text-gray-500 italic p-4 text-center w-full col-span-full">
              No hay módulos en esta comparativa.
            </div>
          )}
        </div>
      ) : view === 'submodulos' ? (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {subModulos.map((s) => (
            <div 
              key={s.id} 
              className="mod-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => loadCasos(s.id, s.nombre)}
            >
              <div className="flex gap-2">
                <div className="flex-1 text-center bg-[var(--cian-bg)] p-3 rounded-l-md border-r border-white">
                  <div className="text-[12px] font-bold text-[var(--cian)] mb-1">Pruebas</div>
                  <div className="text-[20px] font-bold text-[var(--navy)]">
                    {renderPercentage(s.pruebasPct)}
                  </div>
                </div>
                <div className="flex-1 text-center bg-[var(--amarillo-bg)] p-3 rounded-r-md">
                  <div className="text-[12px] font-bold text-[var(--amarillo)] mb-1">Producción</div>
                  <div className="text-[20px] font-bold text-[var(--navy)]">
                    {renderPercentage(s.prodPct)}
                  </div>
                </div>
              </div>
              <div className="mt-3 font-bold text-[14px] text-[var(--navy)] text-center">
                {s.nombre}
              </div>
            </div>
          ))}
          {subModulos.length === 0 && (
            <div className="text-gray-500 italic p-4 text-center w-full col-span-full">
              No hay submódulos en esta comparativa.
            </div>
          )}
        </div>
      ) : (
        <div className="panel p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--grayBg)] text-[12px] text-[var(--gray)] uppercase">
                <th className="p-[12px_16px] font-bold w-1/2">CASO DE PRUEBA</th>
                <th className="p-[12px_16px] font-bold w-1/4">ESTADO PRUEBAS</th>
                <th className="p-[12px_16px] font-bold w-1/4">ESTADO PRODUCCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {casos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-[20px] text-center text-[var(--grayLight)] italic">
                    No hay casos de prueba para comparar.
                  </td>
                </tr>
              ) : (
                casos.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--grayBg)] hover:bg-[var(--grayBg)] transition-colors">
                    <td className="p-[12px_16px]">
                      <div className="font-bold text-[13px] text-[var(--navy)]">{c.nombre}</div>
                    </td>
                    <td className="p-[12px_16px]">
                      {c.estadoPruebas ? (
                        <span className={`tag ${ESTADO_TAG[c.estadoPruebas as keyof typeof ESTADO_TAG]}`}>
                          {ESTADO_LABEL[c.estadoPruebas as keyof typeof ESTADO_LABEL]}
                        </span>
                      ) : (
                        <span className="tag tag-neutral bg-gray-100 text-gray-500 border-none font-normal">SIN DATO</span>
                      )}
                    </td>
                    <td className="p-[12px_16px]">
                      {c.estadoProd ? (
                        <span className={`tag ${ESTADO_TAG[c.estadoProd as keyof typeof ESTADO_TAG]}`}>
                          {ESTADO_LABEL[c.estadoProd as keyof typeof ESTADO_LABEL]}
                        </span>
                      ) : (
                        <span className="tag tag-neutral bg-gray-100 text-gray-500 border-none font-normal">SIN DATO</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

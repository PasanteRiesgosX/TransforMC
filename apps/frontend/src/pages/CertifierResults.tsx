import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BarChart3, Rocket, FlaskConical, Download, Printer } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API, authHeaders, readError } from '../lib/certificaciones';
import { useReactToPrint } from 'react-to-print';
import { CertifierPrint, type EsquemaDetallado } from './CertifierPrint';

const SchemeCard: React.FC<{ sch: EsquemaDetallado, usuario: any }> = ({ sch, usuario }) => {
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Constancia_${sch.nombre.replace(/[^a-z0-9]+/gi, '_')}`,
    onAfterPrint: () => showToast('Impresión completada'),
  });

  const isProd = sch.ambiente === 'Producción';
  const { progreso: p } = sch;
  
  // Calcular semáforo
  const quality = p.ok + p.fail > 0 ? p.ok / (p.ok + p.fail) : 0;
  const isGray = p.ok + p.fail === 0;
  const light = isGray ? 'gray' : quality === 1 ? 'green' : quality >= 0.7 ? 'yellow' : 'red';
  const label = isGray ? 'Sin iniciar' : quality === 1 ? 'Certificación limpia' : quality >= 0.7 ? 'Con fallas menores' : 'Con fallas por resolver';

  const csvEscape = (s: string) => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';

  const handleExportarCSV = () => {
    let lines = [['MÓDULO', 'SUBMÓDULO', 'CASO DE PRUEBA', 'ESTADO', 'COMENTARIO'].map(csvEscape).join(',')];
    
    sch.items.forEach(item => {
      const estTxt = item.estado === 'aprobado' ? 'Cumple' : item.estado === 'rechazado' ? 'No cumple' : 'Pendiente';
      lines.push([item.modulo, item.subModulo, item.casoPrueba, estTxt, item.comentario || ''].map(csvEscape).join(','));
    });

    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificacion_${sch.nombre.replace(/[^a-z0-9]+/gi, '_')}_${usuario?.nombre || ''}${usuario?.apellido || ''}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel p-0 overflow-hidden flex flex-col gap-6">
      {/* Hidden print component */}
      <div style={{ display: 'none' }}>
        <CertifierPrint ref={printRef} esquema={sch} usuario={usuario} />
      </div>

      {/* Sección 1: Estadísticas (Avance General) */}
      <div className="p-6 pb-0">
        <h2 className="font-bold text-[13px] text-[var(--navy)] mb-3">Avance General</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--card)] border-[1.5px] border-[var(--border)] rounded-[10px] p-[18px] shadow-sm">
            <p className="text-[28px] font-bold m-0 text-[var(--navy)]">{p.pct}%</p>
            <p className="text-[11.5px] text-[var(--grayLight)] mt-1 font-semibold">Avance general</p>
          </div>
          <div className="bg-[var(--card)] border-[1.5px] border-[var(--border)] rounded-[10px] p-[18px] shadow-sm">
            <p className="text-[28px] font-bold m-0" style={{ color: 'var(--teal)' }}>{p.ok}</p>
            <p className="text-[11.5px] text-[var(--grayLight)] mt-1 font-semibold">Funcionan bien</p>
          </div>
          <div className="bg-[var(--card)] border-[1.5px] border-[var(--border)] rounded-[10px] p-[18px] shadow-sm">
            <p className="text-[28px] font-bold m-0" style={{ color: 'var(--rojo)' }}>{p.fail}</p>
            <p className="text-[11.5px] text-[var(--grayLight)] mt-1 font-semibold">Con faltas</p>
          </div>
          <div className="bg-[var(--card)] border-[1.5px] border-[var(--border)] rounded-[10px] p-[18px] shadow-sm">
            <p className="text-[28px] font-bold m-0">{p.pendientes}</p>
            <p className="text-[11.5px] text-[var(--grayLight)] mt-1 font-semibold">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Sección 2: Info del esquema y botones */}
      <div className="px-6 border-b-[1px] border-[var(--border)] pb-6">
        <h2 className="font-bold text-[13px] text-[var(--navy)] mb-3">Gestión de resultados</h2>
        <div className="bg-[var(--card)] border-[1px] border-[var(--border)] rounded-[16px] p-[18px] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <div className="font-bold text-[15px] text-[var(--navy)] flex items-center gap-2">
                {sch.nombre}
                {sch.version > 1 && (
                  <span className="text-[10px] font-bold text-[var(--teal)] bg-[#e6f4f1] px-2 py-0.5 rounded-full">
                    v{sch.version}.0
                  </span>
                )}
              </div>
              <div className="text-[12px] text-[var(--grayLight)] mt-[2px] flex items-center gap-1.5">
                {isProd ? <Rocket size={12} /> : <FlaskConical size={12} />}
                {sch.ambiente}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 bg-[#1E2233] rounded-[9px] p-[6px]">
                <span className={`w-[9px] h-[9px] rounded-full bg-[rgba(255,255,255,0.14)] ${light === 'red' ? 'bg-[#FF4D4D] shadow-[0_0_7px_#FF4D4D]' : ''}`}></span>
                <span className={`w-[9px] h-[9px] rounded-full bg-[rgba(255,255,255,0.14)] ${light === 'yellow' ? 'bg-[#FFC93C] shadow-[0_0_7px_#FFC93C]' : ''}`}></span>
                <span className={`w-[9px] h-[9px] rounded-full bg-[rgba(255,255,255,0.14)] ${light === 'green' ? 'bg-[#00E0A4] shadow-[0_0_7px_#00E0A4]' : ''}`}></span>
              </div>
              <span className={`tag ${light === 'green' ? 'tag-teal' : light === 'red' ? 'tag-rojo' : light === 'yellow' ? 'tag-naranja' : 'tag-neutral'}`}>
                {label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn btn-outline btn-sm" onClick={() => handlePrint()}>
              <Printer size={13} />
              Imprimir mi constancia
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleExportarCSV}>
              <Download size={13} />
              Exportar a listado CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Detalle Casos de Prueba */}
      <div className="px-6 pb-6">
        <h2 className="font-bold text-[13px] text-[var(--navy)] mb-3">DETALLE CASOS DE PRUEBA</h2>
        <div className="border-[1px] border-[var(--border)] rounded-[10px] overflow-hidden">
          <table className="w-full text-left border-collapse text-[11.5px]">
            <thead>
              <tr>
                <th className="bg-[#F4F6FA] p-[9px_12px] border-b-[2px] border-[#00AEEF] text-[10px] uppercase tracking-[0.03em] text-[var(--grayLight)]">MÓDULO</th>
                <th className="bg-[#F4F6FA] p-[9px_12px] border-b-[2px] border-[#00AEEF] text-[10px] uppercase tracking-[0.03em] text-[var(--grayLight)]">SUBMÓDULO</th>
                <th className="bg-[#F4F6FA] p-[9px_12px] border-b-[2px] border-[#00AEEF] text-[10px] uppercase tracking-[0.03em] text-[var(--grayLight)]">CASO DE PRUEBA</th>
                <th className="bg-[#F4F6FA] p-[9px_12px] border-b-[2px] border-[#00AEEF] text-[10px] uppercase tracking-[0.03em] text-[var(--grayLight)]">ESTADO</th>
                <th className="bg-[#F4F6FA] p-[9px_12px] border-b-[2px] border-[#00AEEF] text-[10px] uppercase tracking-[0.03em] text-[var(--grayLight)]">COMENTARIO</th>
              </tr>
            </thead>
            <tbody>
              {sch.items.map(item => (
                <tr key={item.id} className="row-hover">
                  <td className="p-[11px_12px] border-b-[1px] border-[var(--border)] text-[13px] text-[var(--gray)]">{item.modulo}</td>
                  <td className="p-[11px_12px] border-b-[1px] border-[var(--border)] text-[13px] text-[var(--gray)]">{item.subModulo}</td>
                  <td className="p-[11px_12px] border-b-[1px] border-[var(--border)] text-[13px] text-[var(--gray)]">{item.casoPrueba}</td>
                  <td className="p-[11px_12px] border-b-[1px] border-[var(--border)] text-[13px] text-[var(--gray)]">
                    <span className={`tag ${item.estado === 'aprobado' ? 'tag-teal' : item.estado === 'rechazado' ? 'tag-rojo' : 'tag-neutral'}`}>
                      {item.estado === 'aprobado' ? 'Cumple' : item.estado === 'rechazado' ? 'No cumple' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-[11px_12px] border-b-[1px] border-[var(--border)] text-[13px] text-[var(--gray)] max-w-[200px] truncate" title={item.comentario}>
                    {item.comentario || <span className="text-[var(--grayLight)] opacity-50">—</span>}
                  </td>
                </tr>
              ))}
              {sch.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-[20px] text-center text-[var(--grayLight)]">No hay casos de prueba en este esquema.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CertifierResults: React.FC = () => {
  const { showToast } = useToast();
  const [esquemas, setEsquemas] = useState<EsquemaDetallado[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userJson = localStorage.getItem('user');
  const usuario = userJson ? JSON.parse(userJson) : { nombre: 'Usuario', apellido: '' };

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        const res = await axios.get(`${API}/api/mis-certificaciones-resultados-detallados`, authHeaders());
        setEsquemas(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar tus resultados'));
      } finally {
        setLoading(false);
      }
    };
    fetchResultados();
  }, [showToast]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando tus resultados...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1 className="page-title">Mis resultados</h1>
        <p className="page-sub">Tu progreso detallado en todas las certificaciones que tienes asignadas.</p>
      </div>

      {esquemas.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="es-icon flex justify-center">
              <BarChart3 size={32} />
            </div>
            <div className="es-title">Todavía no tienes certificaciones asignadas</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {esquemas.map((sch) => (
            <SchemeCard key={sch.id} sch={sch} usuario={usuario} />
          ))}
        </div>
      )}
    </div>
  );
};

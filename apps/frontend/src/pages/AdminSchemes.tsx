import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  FlaskConical,
  Rocket,
  ShieldAlert,
} from 'lucide-react';

const API = 'http://localhost:3000';
const colors = ['cian', 'morado', 'magenta', 'naranja', 'teal'];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

const readError = (err: any, fallback: string) =>
  (Array.isArray(err.response?.data?.message)
    ? err.response?.data?.message[0]
    : err.response?.data?.message) ||
  err.response?.data?.error ||
  fallback;

interface Responsable {
  id: string;
  nombre: string;
  apellido: string;
}
interface SchemeCard {
  id: string;
  nombre: string;
  ambiente: string;
  creadoEn: string;
  responsables: Responsable[];
  _count: { paquetes: number; items: number };
}

export const AdminSchemes: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [schemes, setSchemes] = useState<SchemeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SchemeCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/esquemas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchemes(res.data);
    } catch (err: any) {
      showToast(readError(err, 'Error al cargar los esquemas'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/esquemas/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Esquema eliminado');
      setDeleteTarget(null);
      fetchSchemes();
    } catch (err: any) {
      showToast(readError(err, 'Error al eliminar el esquema'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando esquemas...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1 className="page-title">Esquemas de evaluación</h1>
        <p className="page-sub">
          Un esquema agrupa lo que se va a certificar en un ambiente, organizado en "paquetes" de
          ítems que le asignas a uno o más responsables.
        </p>
      </div>

      <div className="toolbar">
        <div />
        <div className="toolbar-right">
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            iconPosition="left"
            onClick={() => navigate('/admin/esquemas/nuevo')}
          >
            Nuevo esquema
          </Button>
        </div>
      </div>

      {schemes.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="es-icon flex justify-center">
              <ClipboardList size={32} />
            </div>
            <div className="es-title">Todavía no has creado ningún esquema</div>
            Crea el primero para empezar a asignar certificaciones.
          </div>
        </div>
      ) : (
        <div
          className="grid gap-[14px]"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {schemes.map((sch) => {
            const colorName = colors[getHashIndex(sch.id, colors.length)];
            const isProd = sch.ambiente === 'Producción';
            const EnvIcon = isProd ? Rocket : FlaskConical;
            const responsables = sch.responsables || [];
            const shown = responsables.slice(0, 4);
            const extra = responsables.length - shown.length;
            const fecha = new Date(sch.creadoEn).toLocaleDateString('es-EC');
            const total = sch._count.items;

            return (
              <div key={sch.id} className="mod-card group relative">
                <div className="flex items-start justify-between">
                  <div
                    className="mod-icon"
                    style={{
                      backgroundColor: `var(--${colorName}-bg)`,
                      color: `var(--${colorName})`,
                    }}
                  >
                    <EnvIcon size={19} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="icon-btn"
                        title="Editar esquema"
                        onClick={() => navigate(`/admin/esquemas/${sch.id}`)}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Eliminar esquema"
                        onClick={() => setDeleteTarget(sch)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="semaphore" title="En progreso">
                      <span className="semaphore-light light-red" />
                      <span className="semaphore-light light-yellow active" />
                      <span className="semaphore-light light-green" />
                    </div>
                    <span className={`tag ${isProd ? 'tag-magenta' : 'tag-cian'}`}>
                      {sch.ambiente}
                    </span>
                  </div>
                </div>

                <div className="mod-card-title mt-1">{sch.nombre}</div>
                <div className="mod-card-meta">
                  {sch._count.paquetes} paquete{sch._count.paquetes !== 1 ? 's' : ''} · {total} ítem
                  {total !== 1 ? 's' : ''} · creado {fecha}
                </div>

                <div className="flex items-center gap-[6px] my-3 min-h-[30px]">
                  {shown.map((u) => (
                    <div
                      key={u.id}
                      className={`avatar bg-${colors[getHashIndex(u.id, colors.length)]}`}
                      title={`${u.nombre} ${u.apellido}`}
                    >
                      {(u.nombre[0] + u.apellido[0]).toUpperCase()}
                    </div>
                  ))}
                  {extra > 0 && <div className="avatar bg-morado">+{extra}</div>}
                  {responsables.length === 0 && (
                    <span className="text-[11.5px] text-[var(--grayLight)]">Sin responsables aún</span>
                  )}
                </div>

                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '0%' }} />
                </div>
                <div className="text-[11.5px] text-[var(--grayLight)] mt-[6px]">
                  0/{total} ítems certificados
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmar eliminación de esquema */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar esquema"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
              Eliminar
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-[48px] h-[48px] rounded-full bg-[var(--rojo-bg)] text-[var(--rojo)] flex items-center justify-center mb-4">
            <ShieldAlert size={22} />
          </div>
          <p className="text-[14px] text-[var(--gray)] leading-relaxed">
            ¿Estás seguro de que deseas eliminar el esquema{' '}
            <b className="text-[var(--navy)]">{deleteTarget?.nombre}</b>? Se eliminarán en cascada
            todos sus paquetes y sus ítems quedarán liberados.
            <br />
            <br />
            Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>
    </div>
  );
};

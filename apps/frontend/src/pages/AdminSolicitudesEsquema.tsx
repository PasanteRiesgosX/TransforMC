import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { API, authHeaders, readError } from '../lib/resultados';

interface Solicitud {
  id: string;
  motivo: string;
  respuestaAdmin: string | null;
  estado: 'PENDING' | 'APPROVED' | 'REJECTED';
  creadoEn: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export const AdminSolicitudesEsquema: React.FC = () => {
  const { esquemaId } = useParams<{ esquemaId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [esquema, setEsquema] = useState<{ id: string; nombre: string } | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [respuestaAdmin, setRespuestaAdmin] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const [acceptModal, setAcceptModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [accepting, setAccepting] = useState(false);

  const fetchDetalle = async () => {
    try {
      const res = await axios.get(`${API}/api/solicitudes/${esquemaId}`, authHeaders());
      setEsquema(res.data.esquema);
      setSolicitudes(res.data.solicitudes);
    } catch (err: any) {
      showToast(readError(err, 'Error al cargar las solicitudes'));
      navigate('/admin/solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esquemaId]);

  const handleReject = async () => {
    if (!respuestaAdmin.trim()) {
      showToast('Debes proveer un motivo de rechazo');
      return;
    }
    setRejecting(true);
    try {
      await axios.patch(`${API}/api/solicitudes/${rejectModal.id}/rechazar`, { respuestaAdmin }, authHeaders());
      showToast('Solicitud rechazada');
      setRejectModal({ open: false, id: null });
      setRespuestaAdmin('');
      fetchDetalle();
    } catch (err: any) {
      showToast(readError(err, 'Error al rechazar'));
    } finally {
      setRejecting(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await axios.patch(`${API}/api/solicitudes/${acceptModal.id}/aceptar`, {}, authHeaders());
      showToast('Reapertura concedida. El usuario puede editar sus respuestas.');
      setAcceptModal({ open: false, id: null });
      fetchDetalle();
    } catch (err: any) {
      showToast(readError(err, 'Error al aceptar la solicitud'));
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando detalles...</div>;
  }

  return (
    <div className="fade-in">
      <div className="breadcrumbs">
        <Link to="/admin/solicitudes">Solicitudes de reapertura</Link>
        <ChevronRight size={12} className="opacity-50" />
        <span className="current">{esquema?.nombre}</span>
      </div>

      <div className="page-head">
        <h1 className="page-title flex items-center gap-2">
          <FileText className="text-[var(--naranja)]" size={24} />
          Solicitudes en {esquema?.nombre}
        </h1>
        <p className="page-sub">
          Si aceptas una solicitud, se reabrirá la certificación y el usuario podrá modificar sus respuestas.
        </p>
      </div>

      <div className="panel p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--grayBg)] text-[12px] text-[var(--gray)] uppercase">
              <th className="p-[12px_16px] font-bold">CERTIFICADOR</th>
              <th className="p-[12px_16px] font-bold">MOTIVO SOLICITUD</th>
              <th className="p-[12px_16px] font-bold w-[120px]">ESTADO</th>
              <th className="p-[12px_16px] font-bold w-[180px] text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-[20px] text-center text-[var(--grayLight)] italic">
                  No hay solicitudes en este esquema.
                </td>
              </tr>
            ) : (
              solicitudes.map((s) => (
                <tr key={s.id} className="border-t border-[var(--grayBg)] hover:bg-[var(--grayBg)] transition-colors">
                  <td className="p-[12px_16px] align-top">
                    <div className="font-bold text-[13.5px] text-[var(--navy)]">
                      {s.usuario.nombre} {s.usuario.apellido}
                    </div>
                    <div className="text-[11.5px] text-[var(--grayLight)] mt-1">
                      {new Date(s.creadoEn).toLocaleString('es-EC')}
                    </div>
                  </td>
                  <td className="p-[12px_16px] align-top">
                    <div className="text-[13px] text-[var(--navy)] whitespace-pre-wrap">{s.motivo}</div>
                    {s.respuestaAdmin && (
                      <div className="mt-2 p-2 bg-[var(--rojo-bg)] text-[var(--rojo)] rounded text-[12px]">
                        <strong>Respuesta de rechazo:</strong> {s.respuestaAdmin}
                      </div>
                    )}
                  </td>
                  <td className="p-[12px_16px] align-top">
                    {s.estado === 'PENDING' && <span className="tag tag-naranja">PENDIENTE</span>}
                    {s.estado === 'APPROVED' && <span className="tag tag-teal">ACEPTADO</span>}
                    {s.estado === 'REJECTED' && <span className="tag tag-rojo">RECHAZADO</span>}
                  </td>
                  <td className="p-[12px_16px] align-top text-right">
                    {s.estado === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => setRejectModal({ open: true, id: s.id })}
                        >
                          Rechazar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setAcceptModal({ open: true, id: s.id })}
                        >
                          Aceptar
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, id: null });
          setRespuestaAdmin('');
        }}
        title="Rechazar solicitud"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectModal({ open: false, id: null })}>Cancelar</Button>
            <Button variant="danger" onClick={handleReject} disabled={rejecting}>Confirmar Rechazo</Button>
          </>
        }
      >
        <p className="text-[14px] text-[var(--gray)] mb-4 leading-relaxed">
          Ingresa el motivo del rechazo. Este mensaje lo verá el usuario certificador.
        </p>
        <Input
          label="Motivo del rechazo"
          value={respuestaAdmin}
          onChange={(e) => setRespuestaAdmin(e.target.value)}
          placeholder="Ej: Aún te faltan casos por completar en otro módulo..."
        />
      </Modal>

      <Modal
        isOpen={acceptModal.open}
        onClose={() => setAcceptModal({ open: false, id: null })}
        title="Confirmar Reapertura"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAcceptModal({ open: false, id: null })}>Cancelar</Button>
            <Button onClick={handleAccept} disabled={accepting}>Conceder Reapertura</Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-[48px] h-[48px] rounded-full bg-[var(--teal-bg)] text-[var(--teal)] flex items-center justify-center mb-4">
            <CheckCircle2 size={22} />
          </div>
          <p className="text-[14px] text-[var(--gray)] leading-relaxed">
            ¿Estás seguro de conceder la reapertura? <br/> 
            El usuario recuperará acceso de escritura a <b>todos sus casos de prueba</b> y 
            su estado de certificación pasará a no enviado.
          </p>
        </div>
      </Modal>

    </div>
  );
};

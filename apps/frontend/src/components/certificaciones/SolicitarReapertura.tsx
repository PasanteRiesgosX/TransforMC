import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { API, authHeaders, readError, type EstadoEnvio } from '../../lib/certificaciones';

interface SolicitarReaperturaProps {
  esquemaId: string;
  envio: EstadoEnvio;
  solicitudReapertura?: { estado: 'PENDING' | 'APPROVED' | 'REJECTED'; respuestaAdmin?: string } | null;
  onSolicitado: () => void;
}

export const SolicitarReapertura: React.FC<SolicitarReaperturaProps> = ({
  esquemaId,
  envio,
  solicitudReapertura,
  onSolicitado,
}) => {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!motivo.trim()) {
      showToast('Debes ingresar un motivo');
      return;
    }
    setEnviando(true);
    try {
      await axios.post(
        `${API}/api/mis-certificaciones/${esquemaId}/solicitar-reapertura`,
        { motivo },
        authHeaders(),
      );
      showToast('Solicitud enviada');
      setModalOpen(false);
      setMotivo('');
      onSolicitado(); // recarga la pagina
    } catch (err: any) {
      showToast(readError(err, 'No se pudo solicitar la reapertura'));
    } finally {
      setEnviando(false);
    }
  };

  if (!envio.enviado) {
    return (
      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          icon={<RefreshCcw size={16} />}
          onClick={() => showToast('Debes enviar tu certificación antes de poder solicitar una reapertura.')}
        >
          Solicitar reapertura
        </Button>
      </div>
    );
  }

  if (solicitudReapertura?.estado === 'PENDING') {
    return (
      <div className="mt-8 p-4 bg-[var(--amarillo-bg)] text-[var(--naranja)] rounded text-center border border-[var(--amarillo)] text-[14px]">
        <strong>Solicitud de reapertura pendiente:</strong> Estamos revisando tu solicitud.
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {solicitudReapertura?.estado === 'REJECTED' && (
        <div className="p-4 bg-[var(--rojo-bg)] text-[var(--rojo)] rounded border border-[var(--rojo)] text-[14px] w-full max-w-lg">
          <strong>Solicitud anterior rechazada:</strong> {solicitudReapertura.respuestaAdmin}
        </div>
      )}

      <Button
        variant="outline"
        icon={<RefreshCcw size={16} />}
        onClick={() => setModalOpen(true)}
      >
        Solicitar reapertura
      </Button>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Solicitar reapertura"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button onClick={enviar} disabled={enviando}>
              Enviar solicitud
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-[14px] mb-[22px]">
          <div className="min-w-[34px] min-h-[34px] bg-[var(--amarillo-bg)] text-[var(--naranja)] rounded-[var(--radius-m)] flex items-center justify-center">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="font-bold text-[14px] text-[var(--navy)] mb-[6px]">
              ¿Por qué necesitas reabrir la certificación?
            </div>
            <div className="text-[13px] text-[var(--gray)] leading-relaxed mb-4">
              Un administrador deberá revisar tu solicitud y aprobarla antes de que puedas volver a editar tus respuestas.
            </div>
            <Input
              label="Motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Cometí un error en el caso de prueba X..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

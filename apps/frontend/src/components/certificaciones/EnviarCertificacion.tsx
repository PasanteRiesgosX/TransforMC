import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Check, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { API, authHeaders, readError, type EstadoEnvio } from '../../lib/certificaciones';

interface EnviarCertificacionProps {
  esquemaId: string;
  esquemaNombre: string;
  envio: EstadoEnvio;
  /** Se llama con el nuevo estado de envío para que la pantalla pase a solo lectura. */
  onEnviado: (envio: EstadoEnvio) => void;
}

/**
 * Botón "Enviar" de la barra superior, con su confirmación.
 *
 * El envío es IRREVERSIBLE en esta fase (la reapertura es la Fase 6), así que
 * siempre pasa por un modal de confirmación y solo se habilita cuando no queda
 * ningún caso incompleto: enviar a medias dejaría al certificador bloqueado con
 * preguntas sin responder y sin forma de arreglarlo.
 */
export const EnviarCertificacion: React.FC<EnviarCertificacionProps> = ({
  esquemaId,
  esquemaNombre,
  envio,
  onEnviado,
}) => {
  const { showToast } = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setEnviando(true);
    try {
      const res = await axios.post(
        `${API}/api/mis-certificaciones/${esquemaId}/enviar`,
        {},
        authHeaders(),
      );
      onEnviado({
        enviado: true,
        enviadoEn: res.data.enviadoEn,
        incompletos: 0,
        puedeEnviar: false,
      });
      setConfirmando(false);
      showToast(res.data.mensaje ?? 'Certificación enviada');
    } catch (err: any) {
      showToast(readError(err, 'No se pudo enviar la certificación'));
    } finally {
      setEnviando(false);
    }
  };

  // Ya enviado: sello de completado en vez de botón.
  if (envio.enviado) {
    return (
      <span
        className="tag tag-teal whitespace-nowrap"
        style={{ padding: '7px 13px', fontSize: '12px' }}
      >
        <Check size={13} />
        Completado
        {envio.enviadoEn && ` · ${new Date(envio.enviadoEn).toLocaleDateString('es-EC')}`}
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-[10px]">
        {envio.incompletos > 0 && (
          <span className="text-[11.5px] text-[var(--grayLight)] whitespace-nowrap">
            Falta{envio.incompletos !== 1 ? 'n' : ''} {envio.incompletos} caso
            {envio.incompletos !== 1 ? 's' : ''} por completar
          </span>
        )}
        <Button
          variant="warn"
          size="sm"
          icon={<Lock size={14} />}
          disabled={!envio.puedeEnviar}
          onClick={() => setConfirmando(true)}
        >
          Enviar
        </Button>
      </div>

      <Modal
        isOpen={confirmando}
        onClose={() => setConfirmando(false)}
        title="Enviar certificación"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmando(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button variant="warn" onClick={enviar} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Sí, enviar definitivamente'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-[48px] h-[48px] rounded-full bg-[var(--naranja-bg)] text-[var(--naranjaFuerte)] flex items-center justify-center mb-4">
            <ShieldAlert size={22} />
          </div>
          <p className="text-[14px] text-[var(--gray)] leading-relaxed">
            Vas a enviar tu certificación de{' '}
            <b className="text-[var(--navy)]">{esquemaNombre}</b>.
            <br />
            <br />
            Una vez enviada, <b>no vas a poder modificar ninguna respuesta</b>. Vas a poder seguir
            entrando a ver lo que registraste, pero solo de lectura.
          </p>
        </div>
      </Modal>
    </>
  );
};

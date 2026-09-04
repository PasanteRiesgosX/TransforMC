import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getModuleIcon } from './AdminCatalog';
import { EnviarCertificacion } from '../components/certificaciones/EnviarCertificacion';
import {
  API,
  authHeaders,
  colorFor,
  readError,
  type EstadoEnvio,
  type ModuloAsignado,
  type Progreso,
} from '../lib/certificaciones';

interface MisModulos {
  esquema: { id: string; nombre: string; ambiente: string };
  envio: EstadoEnvio;
  progreso: Progreso;
  modulos: ModuloAsignado[];
}

/**
 * NIVEL 1 — módulos del esquema que le tocan a este certificador.
 * Respeta la jerarquía completa: si al usuario le asignaron un solo caso de
 * prueba suelto, aquí ve el módulo al que pertenece, y dentro solo el submódulo
 * de ese caso. Nunca aparece nada que el admin no le haya asignado.
 */
export const CertifierScheme: React.FC = () => {
  const { esquemaId } = useParams<{ esquemaId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<MisModulos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModulos = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/mis-certificaciones/${esquemaId}`,
          authHeaders(),
        );
        setData(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar el esquema'));
        navigate('/certificador/esquemas');
      } finally {
        setLoading(false);
      }
    };
    fetchModulos();
  }, [esquemaId, navigate, showToast]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando...</div>;
  }
  if (!data) return null;

  const { esquema, envio, progreso, modulos } = data;

  return (
    <div className="fade-in">
      <div className="cert-topbar">
        <div className="cert-progress-row">
          <span className="cert-progress-label">{esquema.nombre}</span>
          <div className="cert-progress-track">
            <div className="progress-track">
              <div
                className={`progress-fill ${progreso.pct === 100 ? 'pf-teal' : ''}`}
                style={{ width: `${progreso.pct}%` }}
              />
            </div>
          </div>
          <span className="cert-progress-pct">{progreso.pct}%</span>
          <span className="text-[11.5px] text-[var(--grayLight)] whitespace-nowrap">
            {progreso.done}/{progreso.total} certificados
          </span>
          <EnviarCertificacion
            esquemaId={esquema.id}
            esquemaNombre={esquema.nombre}
            envio={envio}
            onEnviado={(nuevo) => setData((prev) => (prev ? { ...prev, envio: nuevo } : prev))}
          />
        </div>
      </div>

      {envio.enviado && (
        <div className="readonly-banner">
          <div className="readonly-banner-icon">
            <Lock size={15} />
          </div>
          <div>
            <b className="text-[var(--navy)]">Certificación enviada.</b>{' '}
            <span className="text-[var(--gray)]">
              Tus respuestas quedaron consolidadas
              {envio.enviadoEn && ` el ${new Date(envio.enviadoEn).toLocaleString('es-EC')}`}. Puedes
              entrar a consultarlas, pero ya no se pueden modificar.
            </span>
          </div>
        </div>
      )}

      <div className="breadcrumbs">
        <Link to="/certificador/esquemas">Mis certificaciones</Link>
        <ChevronRight size={12} className="opacity-50" />
        <span className="current">{esquema.nombre}</span>
      </div>

      <div className="page-head">
        <h1 className="page-title">{esquema.nombre}</h1>
        <p className="page-sub">
          {envio.enviado
            ? 'Así quedó registrada tu certificación. Entra en un módulo para ver tus respuestas.'
            : 'Estos son los módulos y submódulos que te tocan. Entra en uno para empezar a certificar.'}
        </p>
      </div>

      {modulos.map((mod) => {
        const Icon = getModuleIcon(mod.nombre);
        const color = colorFor(mod.id);
        return (
          <div
            key={mod.id}
            className="module-block"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/certificador/esquemas/${esquema.id}/modulos/${mod.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/certificador/esquemas/${esquema.id}/modulos/${mod.id}`);
              }
            }}
          >
            <div className="module-block-top">
              <div
                className="mod-icon"
                style={{
                  backgroundColor: `var(--${color}-bg)`,
                  color: `var(--${color})`,
                  marginBottom: 0,
                }}
              >
                <Icon size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="module-block-title">{mod.nombre}</div>
                <div className="module-block-meta">
                  {mod.subModulos.length} submódulo{mod.subModulos.length !== 1 ? 's' : ''} ·{' '}
                  {mod.progreso.total} caso{mod.progreso.total !== 1 ? 's' : ''} ·{' '}
                  {mod.progreso.pct}% certificado
                </div>
              </div>
              <span className={`tag ${mod.progreso.pct === 100 ? 'tag-teal' : 'tag-neutral'}`}>
                {mod.progreso.done}/{mod.progreso.total}
              </span>
            </div>

            {mod.subModulos.map((sub) => (
              <div key={sub.id} className="sub-mini-row">
                <span className="sub-mini-name">{sub.nombre}</span>
                <div className="sub-mini-track">
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${sub.progreso.pct === 100 ? 'pf-teal' : ''}`}
                      style={{ width: `${sub.progreso.pct}%` }}
                    />
                  </div>
                </div>
                <span className="sub-mini-pct">{sub.progreso.pct}%</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

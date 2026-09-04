import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Check, Loader2, AlertCircle, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ItemCard } from '../components/certificaciones/ItemCard';
import { EnviarCertificacion } from '../components/certificaciones/EnviarCertificacion';
import {
  API,
  authHeaders,
  readError,
  type CasoCertificable,
  type EstadoCaso,
  type EstadoEnvio,
  type EstadoGuardado,
  type Progreso,
  type SubModuloConCasos,
  casoListo,
} from '../lib/certificaciones';

interface MisCasos {
  esquema: { id: string; nombre: string; ambiente: string };
  modulo: { id: string; nombre: string };
  envio: EstadoEnvio;
  progreso: Progreso;
  subModulos: SubModuloConCasos[];
}

type CampoComentario = 'comentarioFalla' | 'comentarioCambio';

/** Espera antes de mandar lo que se está escribiendo, para no saturar la API. */
const DEBOUNCE_MS = 600;

/**
 * NIVEL 2 — la pantalla de certificación.
 *
 * Los casos van agrupados por submódulo, respetando la jerarquía, y solo
 * aparecen los que el admin asignó a este usuario.
 *
 * Autoguardado: los botones de respuesta mandan un PATCH inmediato; los
 * comentarios esperan {DEBOUNCE_MS}ms de inactividad. No hay botón de guardar.
 */
export const CertifierModule: React.FC = () => {
  const { esquemaId, moduloId } = useParams<{ esquemaId: string; moduloId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<MisCasos | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState<EstadoGuardado>('idle');

  /** Timers de debounce, uno por caso+campo. */
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  /** Peticiones en vuelo, para que el indicador no parpadee con guardados solapados. */
  const enVuelo = useRef(0);

  useEffect(() => {
    const fetchCasos = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/mis-certificaciones/${esquemaId}/modulos/${moduloId}`,
          authHeaders(),
        );
        setData(res.data);
      } catch (err: any) {
        showToast(readError(err, 'Error al cargar los casos de prueba'));
        navigate(`/certificador/esquemas/${esquemaId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCasos();
  }, [esquemaId, moduloId, navigate, showToast]);

  // Al desmontar, cancela lo que quedó pendiente de mandar.
  useEffect(() => {
    const pendientes = timers.current;
    return () => {
      Object.values(pendientes).forEach(clearTimeout);
    };
  }, []);

  /** Manda el PATCH y mantiene el indicador de autoguardado. */
  const guardar = useCallback(
    async (paqueteItemId: string, cuerpo: Record<string, unknown>) => {
      enVuelo.current += 1;
      setGuardado('saving');
      try {
        await axios.patch(
          `${API}/api/mis-certificaciones/items/${paqueteItemId}`,
          cuerpo,
          authHeaders(),
        );
        enVuelo.current -= 1;
        if (enVuelo.current === 0) setGuardado('saved');
      } catch (err: any) {
        enVuelo.current -= 1;
        setGuardado('error');
        showToast(readError(err, 'No se pudo guardar tu respuesta'));
      }
    },
    [showToast],
  );

  /**
   * Aplica el cambio en pantalla al instante y devuelve el caso ya actualizado,
   * para poder recalcular el progreso sin volver a pedir al servidor.
   */
  const aplicarLocal = (
    paqueteItemId: string,
    parche: Partial<CasoCertificable>,
  ) => {
    setData((prev) => {
      if (!prev) return prev;
      const subModulos = prev.subModulos.map((sub) => ({
        ...sub,
        casos: sub.casos.map((c) =>
          c.paqueteItemId === paqueteItemId ? { ...c, ...parche } : c,
        ),
      }));

      // El progreso se mide por la pregunta 1, igual que en Resultados.
      const todos = subModulos.flatMap((s) => s.casos);
      const ok = todos.filter((c) => c.estado === 'aprobado').length;
      const fail = todos.filter((c) => c.estado === 'rechazado').length;
      const done = ok + fail;
      const total = todos.length;

      // "Listo para enviar" es más estricto que el progreso: exige las dos
      // preguntas y los comentarios obligatorios. Se recalcula aquí para que el
      // botón Enviar se habilite sin tener que recargar.
      const incompletos = todos.filter((c) => !casoListo(c)).length;

      return {
        ...prev,
        subModulos,
        progreso: {
          total,
          ok,
          fail,
          done,
          pendientes: total - done,
          pct: total ? Math.round((done / total) * 100) : 0,
        },
        envio: prev.envio.enviado
          ? prev.envio
          : { ...prev.envio, incompletos, puedeEnviar: incompletos === 0 && total > 0 },
      };
    });
  };

  /** Pregunta 1 — guardado inmediato. */
  const handleEstado = (caso: CasoCertificable, estado: EstadoCaso) => {
    // Si deja de estar rechazado, el comentario de falla ya no aplica: el backend
    // lo limpia, así que lo reflejamos también en pantalla.
    const parche: Partial<CasoCertificable> = { estado };
    if (estado !== 'rechazado') parche.comentarioFalla = null;
    aplicarLocal(caso.paqueteItemId, parche);
    guardar(caso.paqueteItemId, { estado });
  };

  /** Pregunta 2 — guardado inmediato. */
  const handleCambio = (caso: CasoCertificable, cambio: boolean) => {
    const parche: Partial<CasoCertificable> = { cambio };
    if (!cambio) parche.comentarioCambio = null;
    aplicarLocal(caso.paqueteItemId, parche);
    guardar(caso.paqueteItemId, { cambio });
  };

  /** Comentarios — se escriben en pantalla ya, se mandan con debounce. */
  const handleComentario = (
    caso: CasoCertificable,
    campo: CampoComentario,
    valor: string,
  ) => {
    aplicarLocal(caso.paqueteItemId, { [campo]: valor } as Partial<CasoCertificable>);

    const clave = `${caso.paqueteItemId}:${campo}`;
    clearTimeout(timers.current[clave]);
    setGuardado('saving');
    timers.current[clave] = setTimeout(() => {
      delete timers.current[clave];
      guardar(caso.paqueteItemId, { [campo]: valor });
    }, DEBOUNCE_MS);
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--grayLight)]">Cargando casos de prueba...</div>;
  }
  if (!data) return null;

  const { esquema, modulo, envio, progreso, subModulos } = data;
  const bloqueado = envio.enviado;
  let contador = 0;

  return (
    <div className="fade-in">
      <div className="cert-topbar">
        <div className="cert-progress-row">
          <span className="cert-progress-label">{modulo.nombre}</span>
          <div className="cert-progress-track">
            <div className="progress-track">
              <div
                className={`progress-fill ${progreso.pct === 100 ? 'pf-teal' : ''}`}
                style={{ width: `${progreso.pct}%` }}
              />
            </div>
          </div>
          <span className="cert-progress-pct">{progreso.pct}%</span>
          {!bloqueado && <IndicadorGuardado estado={guardado} />}
          <EnviarCertificacion
            esquemaId={esquema.id}
            esquemaNombre={esquema.nombre}
            envio={envio}
            onEnviado={(nuevo) => setData((prev) => (prev ? { ...prev, envio: nuevo } : prev))}
          />
        </div>
      </div>

      {bloqueado && (
        <div className="readonly-banner">
          <div className="readonly-banner-icon">
            <Lock size={15} />
          </div>
          <div>
            <b className="text-[var(--navy)]">Certificación enviada.</b>{' '}
            <span className="text-[var(--gray)]">
              Tus respuestas quedaron consolidadas
              {envio.enviadoEn && ` el ${new Date(envio.enviadoEn).toLocaleString('es-EC')}`}. Puedes
              consultarlas, pero ya no se pueden modificar.
            </span>
          </div>
        </div>
      )}

      <div className="breadcrumbs">
        <Link to="/certificador/esquemas">Mis certificaciones</Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link to={`/certificador/esquemas/${esquema.id}`}>{esquema.nombre}</Link>
        <ChevronRight size={12} className="opacity-50" />
        <span className="current">{modulo.nombre}</span>
      </div>

      <div className="page-head">
        <h1 className="page-title">{modulo.nombre}</h1>
        <p className="page-sub">
          {bloqueado
            ? 'Así quedó registrada tu certificación de este módulo.'
            : 'Revisa cada caso: primero si funciona, después si notaste cambios. Si algo falló o cambió, cuéntanos qué pasó. No hace falta guardar, tus respuestas se registran solas.'}
        </p>
      </div>

      {subModulos.map((sub) => (
        <div key={sub.id} className="sub-block">
          <div className="sub-block-title">
            {sub.nombre}
            <span className="sub-block-count">
              {sub.casos.length} caso{sub.casos.length !== 1 ? 's' : ''}
            </span>
          </div>
          {sub.casos.map((caso) => {
            contador += 1;
            return (
              <ItemCard
                key={caso.paqueteItemId}
                caso={caso}
                numero={contador}
                soloLectura={bloqueado}
                onEstado={(estado) => handleEstado(caso, estado)}
                onCambio={(cambio) => handleCambio(caso, cambio)}
                onComentario={(campo, valor) => handleComentario(caso, campo, valor)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Texto sutil que le da certeza al certificador de que no perdió nada. */
const IndicadorGuardado: React.FC<{ estado: EstadoGuardado }> = ({ estado }) => {
  if (estado === 'idle') return null;
  if (estado === 'saving') {
    return (
      <span className="autosave autosave-saving">
        <Loader2 size={12} className="animate-spin" />
        Guardando...
      </span>
    );
  }
  if (estado === 'error') {
    return (
      <span className="autosave autosave-error">
        <AlertCircle size={12} />
        No se pudo guardar
      </span>
    );
  }
  return (
    <span className="autosave autosave-saved">
      <Check size={12} />
      Guardado automáticamente
    </span>
  );
};

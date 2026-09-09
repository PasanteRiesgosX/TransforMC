import React from 'react';
import type { Progreso } from '../lib/certificaciones';
import logoMulti2 from '../assets/img/logoMulti2.svg';

export interface DetalleItem {
  id: string;
  modulo: string;
  subModulo: string;
  casoPrueba: string;
  estado: string;
  cambio: boolean | null;
  comentario: string;
}

export interface EsquemaDetallado {
  id: string;
  nombre: string;
  ambiente: string;
  version: number;
  progreso: Progreso;
  envio: { enviado: boolean; enviadoEn: string | null };
  items: DetalleItem[];
}

interface CertifierPrintProps {
  esquema: EsquemaDetallado | null;
  usuario: any;
}

const CERT_STYLE = `
  .cert-container { font-family: Arial, Helvetica, 'Segoe UI', sans-serif; color: #1E2233; background: #fff; padding: 40px 56px; }
  .cert-header { display: flex; align-items: center; gap: 18px; border-bottom: 3px solid #00AEEF; padding-bottom: 16px; margin-bottom: 22px; }
  .cert-header img { height: 32px; }
  .cert-kicker { font-size: 10.5px; letter-spacing: 0.1em; color: #8A90A4; font-weight: 700; text-transform: uppercase; margin: 0 0 3px; }
  .cert-header h1 { font-size: 23px; margin: 0 0 4px; }
  .cert-sub { font-size: 12.5px; color: #6E747A; margin: 0; }
  .cert-infobar { display: flex; background: #F4F6FA; border: 1px solid #E7EAF2; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; gap: 26px; flex-wrap: wrap; align-items: center; }
  .cert-infobar .ib { display: flex; flex-direction: column; }
  .cert-infobar .ib span { font-size: 9.5px; color: #8A90A4; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
  .cert-infobar .ib b { font-size: 13px; }
  .cert-infobar .status-block { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .cert-status-label { font-weight: 700; font-size: 13px; }
  .semaphore { display: inline-flex; flex-direction: column; gap: 4px; background: #1E2233; border-radius: 9px; padding: 6px; }
  .semaphore-light { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,0.14); display: block; }
  .semaphore-light.light-red.active { background: #FF4D4D; box-shadow: 0 0 7px #FF4D4D; }
  .semaphore-light.light-yellow.active { background: #FFC93C; box-shadow: 0 0 7px #FFC93C; }
  .semaphore-light.light-green.active { background: #00E0A4; box-shadow: 0 0 7px #00E0A4; }
  .cert-stats { display: flex; gap: 14px; margin-bottom: 26px; flex-wrap: wrap; }
  .cert-stats .rstat { background: #F4F6FA; border: 1px solid #E7EAF2; border-radius: 10px; padding: 12px 18px; flex: 1; min-width: 120px; }
  .cert-stats .rstat b { font-size: 21px; display: block; margin-bottom: 2px; }
  .cert-stats .rstat span { font-size: 10.5px; color: #6E747A; }
  .cert-container h2 { font-size: 14px; margin: 24px 0 10px; }
  .cert-container table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .cert-container th { text-align: left; background: #F4F6FA; padding: 7px 10px; border-bottom: 2px solid #00AEEF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; }
  .cert-container td { padding: 7px 10px; border-bottom: 1px solid #eee; }
  .cert-sign { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 38px; padding-top: 16px; border-top: 1px solid #E7EAF2; gap: 20px; }
  .cert-sign .sb span { font-size: 10px; color: #8A90A4; text-transform: uppercase; letter-spacing: 0.04em; }
  .cert-sign .sb b { font-size: 13px; display: block; border-top: 1px solid #1E2233; padding-top: 6px; margin-top: 22px; }
  .cert-note { font-size: 9.5px; color: #9AA0AC; line-height: 1.5; margin-top: 26px; }
  @media print { .cert-container { padding: 20px 30px; } }
`;

export const CertifierPrint = React.forwardRef<HTMLDivElement, CertifierPrintProps>(({ esquema, usuario }, ref) => {
  if (!esquema) return null;

  const { progreso: p } = esquema;

  const quality = p.ok + p.fail > 0 ? p.ok / (p.ok + p.fail) : 0;
  const isGray = p.ok + p.fail === 0;
  const light = isGray ? 'gray' : quality === 1 ? 'green' : quality >= 0.7 ? 'yellow' : 'red';
  const label = isGray ? 'Sin iniciar' : quality === 1 ? 'Certificación limpia' : quality >= 0.7 ? 'Con fallas menores' : 'Con fallas por resolver';

  const folio = 'VC5-' + esquema.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6) + '-' + (usuario?.id?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-4) || 'USER');
  const fecha = esquema.envio?.enviadoEn ? new Date(esquema.envio.enviadoEn).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div ref={ref}>
      <style>{CERT_STYLE}</style>
      <div className="cert-container">
        <div className="cert-header">
          <img src={logoMulti2} alt="Multicines" />
          <div>
            <p className="cert-kicker">Certificación Vista 5.0 · Multicines S.A.</p>
            <h1>Constancia de Certificación Individual</h1>
            <p className="cert-sub">{usuario?.nombre} {usuario?.apellido} - {esquema.nombre}</p>
          </div>
        </div>
        
        <div className="cert-infobar">
          <div className="ib"><span>Folio</span><b>{folio}</b></div>
          <div className="ib"><span>Ambiente</span><b>{esquema.ambiente}</b></div>
          <div className="ib"><span>Fecha de emisión</span><b>{fecha}</b></div>
          <div className="status-block">
            <div className="semaphore">
              <span className={`semaphore-light light-red ${light === 'red' ? 'active' : ''}`}></span>
              <span className={`semaphore-light light-yellow ${light === 'yellow' ? 'active' : ''}`}></span>
              <span className={`semaphore-light light-green ${light === 'green' ? 'active' : ''}`}></span>
            </div>
            <span className="cert-status-label" style={{ color: light === 'green' ? '#00806E' : light === 'red' ? '#E53935' : '#B8860B' }}>
              {label}
            </span>
          </div>
        </div>
        
        <div className="cert-stats">
          <div className="rstat"><b>{p.pct}%</b><span>Avance</span></div>
          <div className="rstat"><b>{p.ok}</b><span>Funcionan bien</span></div>
          <div className="rstat"><b>{p.fail}</b><span>Con fallas</span></div>
          <div className="rstat"><b>{p.pendientes}</b><span>Pendientes</span></div>
        </div>
        
        <h2>Detalle de lo certificado</h2>
        <table>
          <thead>
            <tr>
              <th>Módulo — Submódulo</th>
              <th>Caso de prueba</th>
              <th>Estado</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {esquema.items.map(item => {
              const estTxt = item.estado === 'aprobado' ? 'Funciona' : item.estado === 'rechazado' ? 'No funciona' : 'Pendiente';
              return (
                <tr key={item.id}>
                  <td>{item.modulo} — {item.subModulo}</td>
                  <td>{item.casoPrueba}</td>
                  <td>{estTxt}</td>
                  <td>{item.comentario || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="cert-sign">
          <div className="sb">
            <span>Certificado por</span>
            <b>{usuario?.nombre} {usuario?.apellido}</b>
          </div>
          <div className="sb" style={{ textAlign: 'right' }}>
            <span>{esquema.envio?.enviado ? 'Enviado el' : 'Estado al'}</span>
            <b>{fecha}</b>
          </div>
        </div>
        
        <p className="cert-note">
          Esta constancia resume lo certificado por {usuario?.nombre} {usuario?.apellido} dentro del esquema "{esquema.nombre}", como parte del proceso de actualización del sistema Vista. Documento generado automáticamente por la app de Certificación Vista 5.0 - Multicines S.A.
        </p>
      </div>
    </div>
  );
});

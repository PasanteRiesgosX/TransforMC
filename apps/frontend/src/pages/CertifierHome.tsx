import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

export const CertifierHome: React.FC = () => {
  const { user } = useAuth();
  
  const nombre = user?.nombre || 'Certificador';
  const cargo = user?.cargo || 'Certificador';
  const email = user?.email || 'usuario@ejemplo.com';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[23px] font-bold text-[var(--navy)] mb-2">
          Hola, {nombre} 👋
        </h1>
        <p className="text-[13px] text-[var(--grayLight)] leading-[1.6] max-w-[760px]">
          {cargo} — Bienvenido a Certificación Vista 5.0. Aquí verás los módulos y secciones que el administrador te asigne para certificar.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-l)] p-[18px] shadow-[var(--shadow-sm)] max-w-[320px]">
        <div className="flex items-center gap-4 mb-4">
          <Avatar size="lg" name={nombre} colorIndex={1} />
          <div>
            <div className="text-[14.5px] font-bold text-[var(--navy)]">{nombre}</div>
            <div className="text-[12px] text-[var(--grayLight)]">{cargo}</div>
          </div>
        </div>
        
        <div className="text-[11.5px] text-[var(--grayLight)] mb-5 pb-4 border-b border-[var(--border)]">
          {email}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge color="cian">Certificador</Badge>
          <Badge color="teal">Sesión activa</Badge>
        </div>
      </div>
    </div>
  );
};

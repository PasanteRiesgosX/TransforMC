import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SignatureBar } from '../components/ui/SignatureBar';
import { LogoPlaceholder } from '../components/ui/LogoPlaceholder';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setLandingRole } = useAuth();

  const handleSelectRole = (role: 'admin' | 'user') => {
    setLandingRole(role);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--navy)] flex flex-col">
      <SignatureBar />
      
      <div className="flex-1 flex items-center justify-center p-[32px]">
        <div className="w-full max-w-[560px] text-center">
          
          <div className="flex justify-center mb-[36px]">
            <LogoPlaceholder variant="landing" />
          </div>

          <h1 className="text-white text-[30px] font-[700] m-0 mb-[14px] leading-[1.25]">
            Certificación Vista 5.0
          </h1>
          <p className="text-[#AEB4C4] text-[15px] leading-[1.6] m-0 mb-[40px]">
            Aquí certificamos que el sistema Vista funciona correctamente después de la actualización de versión, tanto en el ambiente de pruebas como en producción, antes de salir en vivo en los complejos de Multicines
          </p>
          
          <div className="flex flex-wrap gap-[16px] justify-center">
            {/* Admin Card */}
            <button 
              onClick={() => handleSelectRole('admin')}
              className="flex-1 min-w-[210px] text-left bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.14)] rounded-[var(--radius-l)] px-[22px] py-[28px] transition-all duration-150 ease hover:bg-[rgba(255,255,255,0.08)] hover:border-[color:var(--cian)] hover:-translate-y-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--cian)] focus:ring-offset-2 focus:ring-offset-[color:var(--navy)]"
            >
              <div className="w-[44px] h-[44px] rounded-[12px] bg-[var(--morado-bg)] flex items-center justify-center mb-[16px]">
                <Settings size={20} color="var(--morado)" />
              </div>
              <h2 className="text-white text-[16px] font-[700] m-0 mb-[6px]">Soy administrador</h2>
              <p className="text-[#AEB4C4] text-[12.5px] leading-[1.5] m-0">
                Gestiono usuarios, el catálogo de certificación, los esquemas de evaluación y reviso los resultados.
              </p>
            </button>

            {/* Certifier Card */}
            <button 
              onClick={() => handleSelectRole('user')}
              className="flex-1 min-w-[210px] text-left bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.14)] rounded-[var(--radius-l)] px-[22px] py-[28px] transition-all duration-150 ease hover:bg-[rgba(255,255,255,0.08)] hover:border-[color:var(--cian)] hover:-translate-y-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--cian)] focus:ring-offset-2 focus:ring-offset-[color:var(--navy)]"
            >
              <div className="w-[44px] h-[44px] rounded-[12px] bg-[var(--cian-bg)] flex items-center justify-center mb-[16px]">
                <CheckCircle size={20} color="var(--cian)" />
              </div>
              <h2 className="text-white text-[16px] font-[700] m-0 mb-[6px]">Soy certificador</h2>
              <p className="text-[#AEB4C4] text-[12.5px] leading-[1.5] m-0">
                Voy a certificar los módulos y secciones que me fueron asignados.
              </p>
            </button>
          </div>
        </div>
      </div>
      
      <div className="py-[22px] px-[32px] text-center text-[#6E7690] text-[11.5px]">
        © 2026 Multicines. Todos los derechos reservados.
      </div>
    </div>
  );
};

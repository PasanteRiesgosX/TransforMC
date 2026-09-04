import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  LayoutGrid,
  ClipboardList,
  BarChart3,
  FileText
} from 'lucide-react';
import { SignatureBar } from '../ui/SignatureBar';
import { LogoPlaceholder } from '../ui/LogoPlaceholder';
import { Avatar } from '../ui/Avatar';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      <SignatureBar />
      {/* Topbar */}
      <header className="h-[60px] bg-[var(--navy)] flex items-center justify-between px-[16px] min-[860px]:px-[24px] sticky top-0 z-40">
        <div className="flex items-center">
          <LogoPlaceholder variant="topbar" />
          <div className="ml-[16px] pl-[16px] border-l border-[rgba(255,255,255,0.15)] flex items-center h-[20px]">
            <span className="text-[12px] text-[#AEB4C4]">Panel de administración</span>
          </div>
        </div>

        <div className="flex items-center gap-[16px]">
          {user && (
            <div className="hidden sm:flex items-center gap-[9px] text-[12.5px] text-[#D6DAE5]">
              <Avatar 
                name={user.nombre} 
                lastName={user.apellido} 
                size="sm" 
                colorIndex={0} 
              />
              <span>{user.nombre} {user.apellido}</span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.16)] text-white px-[14px] py-[7px] rounded-[20px] text-[12px] font-bold transition-colors hover:bg-[rgba(255,255,255,0.16)]"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Body Shell */}
      <div className="flex flex-1 min-h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className="w-[224px] bg-[var(--card)] border-r border-[var(--border)] p-[18px_12px] flex-shrink-0">
          <nav className="flex flex-col">
            <NavLink
              to="/admin/usuarios"
              className={({ isActive }) =>
                `flex items-center gap-[11px] p-[10px_12px] rounded-[var(--radius-s)] text-[13.5px] font-bold mb-[3px] transition-colors ${
                  isActive 
                    ? 'bg-[var(--cian-bg)] text-[var(--cian)]' 
                    : 'text-[var(--gray)] hover:bg-[var(--bg)]'
                }`
              }
            >
              <Users size={18} />
              Usuarios
            </NavLink>

            <NavLink
              to="/admin/catalogo"
              className={({ isActive }) =>
                `flex items-center gap-[11px] p-[10px_12px] rounded-[var(--radius-s)] text-[13.5px] font-bold mb-[3px] transition-colors ${
                  isActive 
                    ? 'bg-[var(--cian-bg)] text-[var(--cian)]' 
                    : 'text-[var(--gray)] hover:bg-[var(--bg)]'
                }`
              }
            >
              <LayoutGrid size={18} />
              Catálogo
            </NavLink>

            <NavLink
              to="/admin/esquemas"
              className={({ isActive }) =>
                `flex items-center gap-[11px] p-[10px_12px] rounded-[var(--radius-s)] text-[13.5px] font-bold mb-[3px] transition-colors ${
                  isActive
                    ? 'bg-[var(--cian-bg)] text-[var(--cian)]'
                    : 'text-[var(--gray)] hover:bg-[var(--bg)]'
                }`
              }
            >
              <ClipboardList size={18} />
              Esquemas de evaluación
            </NavLink>

            <NavLink
              to="/admin/resultados"
              className={({ isActive }) =>
                `flex items-center gap-[11px] p-[10px_12px] rounded-[var(--radius-s)] text-[13.5px] font-bold mb-[3px] transition-colors ${
                  isActive
                    ? 'bg-[var(--cian-bg)] text-[var(--cian)]'
                    : 'text-[var(--gray)] hover:bg-[var(--bg)]'
                }`
              }
            >
              <BarChart3 size={18} />
              Resultados
            </NavLink>

            <div className="flex items-center gap-[11px] p-[10px_12px] rounded-[var(--radius-s)] text-[13.5px] font-bold mb-[3px] text-[var(--grayLight)] opacity-55 cursor-default">
              <FileText size={18} />
              Solicitudes
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-[20px] min-[860px]:p-[28px_32px] w-full max-w-[1280px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

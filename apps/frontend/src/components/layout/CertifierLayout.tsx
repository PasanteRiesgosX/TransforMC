import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SignatureBar } from '../ui/SignatureBar';
import { LogoPlaceholder } from '../ui/LogoPlaceholder';
import { Avatar } from '../ui/Avatar';
import { LogOut } from 'lucide-react';

export const CertifierLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <SignatureBar />
      
      <header className="h-[72px] bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <LogoPlaceholder variant="topbar" />
          <div className="h-6 w-px bg-[var(--border)]" />
          <span className="text-[15px] font-bold text-[var(--navy)]">Certificador</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[13px] font-bold text-[var(--navy)]">{user?.nombre || 'Certificador'}</div>
              <div className="text-[11px] text-[var(--grayLight)]">Certificador</div>
            </div>
            <Avatar size="sm" name={user?.nombre || 'Certificador'} colorIndex={1} />
          </div>
          
          <div className="h-6 w-px bg-[var(--border)]" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[13px] font-bold text-[var(--grayLight)] hover:text-[var(--rojo)] transition-colors"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 flex justify-center w-full">
        <div className="w-full max-w-[1280px] p-[28px_32px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

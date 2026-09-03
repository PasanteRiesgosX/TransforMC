import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SignatureBar } from '../components/ui/SignatureBar';
import { ShieldCheck, LogOut } from 'lucide-react';
import axios from 'axios';

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateForceChange, logout } = useAuth();
  const { showToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Protect route
  if (!user || !user.forceChange) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/auth/change-password', 
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateForceChange(false);
      showToast('Contraseña actualizada correctamente');
      
      if (user.role === 'ADMIN') {
        navigate('/admin/usuarios');
      } else {
        navigate('/certificador/esquemas');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--navy)] fade-in">
      <SignatureBar />
      
      <div className="p-[20px_28px] flex justify-end">
        <button 
          onClick={handleLogout}
          className="inline-flex items-center gap-[7px] text-[#AEB4C4] text-[13px] font-bold transition-colors hover:text-white"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-[20px]">
        <div 
          className="w-full max-w-[400px] bg-[var(--card)] rounded-[var(--radius-l)] px-[32px] py-[36px]"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <div className="w-[48px] h-[48px] bg-[var(--cian-bg)] text-[var(--cian)] rounded-full flex items-center justify-center mb-[18px] mx-auto">
            <ShieldCheck size={22} />
          </div>
          
          <h2 className="text-[22px] font-bold text-[var(--navy)] m-0 mb-[6px] text-center">Crea tu contraseña</h2>
          <p className="text-[var(--grayLight)] text-[13px] m-0 mb-[24px] text-center leading-[1.6]">
            Por seguridad, debes crear una nueva contraseña para tu primer ingreso al sistema.
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <div className="error-msg slide-up text-center justify-center">
                {error}
              </div>
            )}

            <div className="mt-8">
              <Button 
                type="submit" 
                fullWidth 
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar y Continuar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

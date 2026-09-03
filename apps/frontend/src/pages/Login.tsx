import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SignatureBar } from '../components/ui/SignatureBar';
import axios from 'axios';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { landingRole, setLandingRole, login } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthAdmin = landingRole === 'admin';
  const RoleIcon = isAuthAdmin ? ShieldCheck : UserCheck;
  const badgeColorClass = isAuthAdmin 
    ? 'bg-[var(--cian-bg)] text-[var(--cian)]' 
    : 'bg-[var(--morado-bg)] text-[var(--morado)]';

  const handleBack = () => {
    setLandingRole(null);
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      // In reality, this points to your backend. 
      // For now, we point to the NestJS server.
      const res = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
        landingRole: landingRole || 'user'
      });
      
      const { access_token, user } = res.data;
      login(access_token, user);
      
      showToast('Inicio de sesión exitoso');
      
      if (user.forceChange) {
        navigate('/primer-ingreso');
      } else {
        if (user.role === 'ADMIN') {
          navigate('/admin/usuarios');
        } else {
          navigate('/certificador/esquemas');
        }
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--navy)] fade-in">
      <SignatureBar />
      
      <div className="px-[28px] py-[20px]">
        <button 
          onClick={handleBack}
          className="inline-flex items-center gap-[7px] text-[#AEB4C4] text-[13px] font-[700] transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-[20px]">
        <div 
          className="w-full max-w-[400px] bg-[var(--card)] rounded-[var(--radius-l)] px-[32px] py-[36px]"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          {landingRole && (
            <div className={`inline-flex items-center gap-[7px] px-[12px] py-[5px] rounded-[20px] text-[11.5px] font-[700] mb-[18px] ${badgeColorClass}`}>
              <RoleIcon size={14} />
              Acceso {isAuthAdmin ? 'Administrador' : 'Certificador'}
            </div>
          )}
          
          <h2 className="text-[22px] font-[700] text-[var(--navy)] m-0 mb-[6px]">Iniciar sesión</h2>
          <p className="text-[var(--grayLight)] text-[13px] m-0 mb-[24px]">Ingresa tus credenciales para continuar.</p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@midominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
            
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <div className="error-msg slide-up">
                {error}
              </div>
            )}

            <div className="mt-8">
              <Button 
                type="submit" 
                fullWidth 
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar al sistema'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


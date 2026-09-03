import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { AdminUsers } from './pages/AdminUsers';
import { AdminCatalog } from './pages/AdminCatalog';
import { AdminCatalogDetail } from './pages/AdminCatalogDetail';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role !== 'ADMIN') return <Navigate to="/certificador/esquemas" />;
  if (user.forceChange) return <Navigate to="/primer-ingreso" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/primer-ingreso" element={<ChangePassword />} />
      
      {/* Rutas de Administrador */}
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="usuarios" />} />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="catalogo" element={<AdminCatalog />} />
        <Route path="catalogo/:id" element={<AdminCatalogDetail />} />
        <Route path="dashboard" element={
          <div className="p-8 text-center text-gray-500">
            Dashboard en construcción...
          </div>
        } />
      </Route>

      {/* Rutas de Certificador (Placeholder para el futuro) */}
      <Route path="/certificador/*" element={
        <div className="p-8 text-center">
          Módulo de certificador en construcción... <br />
          <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="text-blue-500 mt-4">Salir</button>
        </div>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

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
import { AdminSchemes } from './pages/AdminSchemes';
import { AdminSchemeEditor } from './pages/AdminSchemeEditor';
import { AdminResults } from './pages/AdminResults';
import { AdminResultsScheme } from './pages/AdminResultsScheme';
import { AdminResultsModule } from './pages/AdminResultsModule';
import { AdminResultsSubModule } from './pages/AdminResultsSubModule';
import { CertifierSchemes } from './pages/CertifierSchemes';
import { CertifierScheme } from './pages/CertifierScheme';
import { CertifierModule } from './pages/CertifierModule';
import { CertifierResults } from './pages/CertifierResults';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import { CertifierLayout } from './components/layout/CertifierLayout';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role !== 'ADMIN') return <Navigate to="/certificador/esquemas" />;
  if (user.forceChange) return <Navigate to="/primer-ingreso" />;
  return <>{children}</>;
};

const ProtectedCertifierRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role !== 'CERTIFIER') return <Navigate to="/admin/usuarios" />;
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
        <Route path="esquemas" element={<AdminSchemes />} />
        <Route path="esquemas/nuevo" element={<AdminSchemeEditor />} />
        <Route path="esquemas/:id" element={<AdminSchemeEditor />} />

        {/* Fase 4 — Resultados: drill-down esquema › módulo › submódulo › tabla */}
        <Route path="resultados" element={<AdminResults />} />
        <Route path="resultados/:esquemaId" element={<AdminResultsScheme />} />
        <Route
          path="resultados/:esquemaId/modulos/:moduloId"
          element={<AdminResultsModule />}
        />
        <Route
          path="resultados/:esquemaId/submodulos/:subModuloId"
          element={<AdminResultsSubModule />}
        />
        <Route path="dashboard" element={
          <div className="p-8 text-center text-gray-500">
            Dashboard en construcción...
          </div>
        } />
      </Route>

      {/* Fase 5 — Certificador: esquema › módulo › casos de prueba */}
      <Route
        path="/certificador"
        element={
          <ProtectedCertifierRoute>
            <CertifierLayout />
          </ProtectedCertifierRoute>
        }
      >
        <Route index element={<Navigate to="esquemas" />} />
        <Route path="esquemas" element={<CertifierSchemes />} />
        <Route path="esquemas/:esquemaId" element={<CertifierScheme />} />
        <Route
          path="esquemas/:esquemaId/modulos/:moduloId"
          element={<CertifierModule />}
        />
        <Route path="resultados" element={<CertifierResults />} />
        <Route path="*" element={<Navigate to="/certificador/esquemas" />} />
      </Route>

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

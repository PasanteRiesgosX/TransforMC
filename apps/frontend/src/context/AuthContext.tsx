import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'ADMIN' | 'CERTIFIER';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  cargo?: string;
  email: string;
  role: Role;
  forceChange: boolean;
}

interface AuthContextType {
  user: User | null;
  landingRole: string | null;
  setLandingRole: (role: string | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateForceChange: (forceChange: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [landingRole, setLandingRole] = useState<string | null>(null);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLandingRole(null);
  };

  const updateForceChange = (forceChange: boolean) => {
    if (user) {
      setUser({ ...user, forceChange });
    }
  };

  return (
    <AuthContext.Provider value={{ user, landingRole, setLandingRole, login, logout, updateForceChange }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

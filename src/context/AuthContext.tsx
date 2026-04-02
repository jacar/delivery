import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  userData: Usuario | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'delivery_user_v2'; // v2 limpia sesiones viejas de Firebase

// Normaliza el objeto del backend para que siempre tenga uid y rol correctos
const normalizeUser = (raw: any): Usuario => ({
  uid:            raw.uid || raw.id || '',
  nombre:        raw.nombre || raw.name || 'Usuario',
  email:         raw.email || '',
  rol:           raw.rol || 'cliente',
  fcmToken:      raw.fcmToken || undefined,
  telefono:      raw.telefono || undefined,
  tipoVehiculo:  raw.tipoVehiculo || undefined,
  placaVehiculo: raw.placaVehiculo || undefined,
  documentoId:   raw.documentoId || undefined,
  fotoUrl:       raw.fotoUrl || undefined,
  disponible:    raw.disponible ?? true,
  ocupado:       raw.ocupado ?? false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (rawData: any) => {
    const normalized = normalizeUser(rawData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    // Limpiar claves antiguas también
    localStorage.removeItem('delivery_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData: user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

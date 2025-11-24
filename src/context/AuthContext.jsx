import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);
const AUTH_STORAGE_PREFIX = import.meta.env.VITE_AUTH_STORAGE_KEY || 'SHOPERSA';
const REQUIRE_JWT = String(import.meta.env.VITE_AUTH_REQUIRE_JWT).toLowerCase() === 'true';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem(`${AUTH_STORAGE_PREFIX}:usuarioLogueado`) || sessionStorage.getItem('usuarioLogueado');
    const storedToken = localStorage.getItem(`${AUTH_STORAGE_PREFIX}:authToken`) || sessionStorage.getItem('authToken');
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        const normalized = {
          ...parsed,
          isAdmin: (parsed?.isAdmin ?? parsed?.admin ?? false) || (String(parsed?.role).toUpperCase() === 'ADMIN'),
        };
        setUser(normalized);
      } catch (_) {}
    }
    if (storedToken) setToken(storedToken);
  }, []);

  const login = (userData, jwtToken = null, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    const normalized = {
      ...userData,
      isAdmin: (userData?.isAdmin ?? userData?.admin ?? false) || (String(userData?.role).toUpperCase() === 'ADMIN'),
    };
    storage.setItem(`${AUTH_STORAGE_PREFIX}:usuarioLogueado`, JSON.stringify(normalized));
    // Solo guarda token si existe
    if (jwtToken) {
      storage.setItem(`${AUTH_STORAGE_PREFIX}:authToken`, jwtToken);
      sessionStorage.setItem('authToken', jwtToken);
    } else {
      storage.removeItem(`${AUTH_STORAGE_PREFIX}:authToken`);
      sessionStorage.removeItem('authToken');
    }
    // Mantener compatibilidad con claves previas
    sessionStorage.setItem('usuarioLogueado', JSON.stringify(normalized));
    setUser(normalized);
    setToken(jwtToken || null);
  };

  const logout = () => {
    localStorage.removeItem(`${AUTH_STORAGE_PREFIX}:usuarioLogueado`);
    localStorage.removeItem(`${AUTH_STORAGE_PREFIX}:authToken`);
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  };

  // En modo sin JWT, consideramos autenticación válida si hay usuario
  const isAuthenticated = REQUIRE_JWT ? !!token : !!user;

  const value = { user, token, login, logout, isAuthenticated };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
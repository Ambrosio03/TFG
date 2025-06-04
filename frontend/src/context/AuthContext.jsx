import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authLogin, logout as authLogout, getUser as getStoredUser } from '../services/auth';

/**
 * Contexto de autenticación.
 * Proporciona estado y funciones para manejar la autenticación de usuarios.
 * Incluye login, logout y verificación de roles.
 */
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * Proveedor del contexto de autenticación.
 * Maneja el estado de autenticación y proporciona funciones de autenticación.
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a envolver
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar el usuario al cargar
    const storedUser = getStoredUser();
    if (storedUser && storedUser.role) {
      console.log('Usuario cargado del localStorage:', storedUser); // Debug
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      console.log('Iniciando login con datos:', userData); // Debug
      const response = await authLogin(userData.email, userData.password);
      console.log('Respuesta del login:', response); // Debug

      if (!response || !response.user) {
        console.error('Respuesta inválida:', response); // Debug
        throw new Error('Respuesta de login inválida');
      }

      if (!response.user.role) {
        console.error('Usuario sin rol:', response.user); // Debug
        throw new Error('Usuario sin rol asignado');
      }

      setUser(response.user);
      // Sincronizar con localStorage explícitamente
      localStorage.setItem('user', JSON.stringify(response.user));
      // No navegar aquí, dejar que el componente decida
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

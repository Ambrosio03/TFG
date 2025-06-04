import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de ruta protegida.
 * Verifica si el usuario está autenticado y tiene los permisos necesarios.
 * Redirige a login si no está autenticado o a home si no tiene permisos.
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar
 * @param {boolean} props.requireAdmin - Indica si se requiere rol de administrador
 */
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (requireAdmin && !hasRole('ROLE_ADMIN')) {
      navigate('/');
    }
  }, [user, requireAdmin, hasRole, navigate]);

  if (!user || (requireAdmin && !hasRole('ROLE_ADMIN'))) {
    return null;
  }

  return children;
}; 
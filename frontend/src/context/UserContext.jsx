import { createContext, useState, useEffect } from 'react';

/**
 * Contexto de usuario.
 * Proporciona estado y funciones para manejar la información del usuario.
 * Incluye datos del perfil y funciones de actualización.
 */
export const UserContext = createContext();

/**
 * Proveedor del contexto de usuario.
 * Maneja el estado del usuario y proporciona funciones para actualizar su información.
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a envolver
 */
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Actualiza los datos del usuario.
   * @param {Object} data - Nuevos datos del usuario
   */
  const updateUserData = (data) => {
    setUserData(data);
  };

  /**
   * Actualiza el perfil del usuario en el servidor.
   * @param {Object} profileData - Datos del perfil a actualizar
   */
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
    } catch (error) {
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

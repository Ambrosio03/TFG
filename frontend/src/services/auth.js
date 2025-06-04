/**
 * Servicio de autenticación.
 * Proporciona funciones para manejar la autenticación de usuarios.
 * Incluye login, registro, verificación de token y gestión de sesión.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Si el usuario está bloqueado, el backend debería devolver un código específico
    if (response.status === 403 && data.detail === 'Usuario bloqueado') {
      throw new Error('USUARIO_BLOQUEADO');
    }
    throw new Error(data.detail || 'Error en la autenticación');
  }
  return data;
};

/**
 * Inicia sesión con las credenciales proporcionadas.
 * @param {Object} credentials - Credenciales de inicio de sesión
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario y token
 */
export const login = async (email, password) => {
  try {
    console.log('Iniciando proceso de login...');
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await handleResponse(response);
    console.log('Respuesta del servidor:', data); // Debug

    // Asegurarnos de que la respuesta tenga el formato correcto
    if (!data || !data.id || !data.role) {
      throw new Error('Formato de respuesta inválido');
    }

    // Verificar si el usuario está bloqueado
    if (data.isBlocked) {
      throw new Error('USUARIO_BLOQUEADO');
    }

    // Formatear la respuesta para que coincida con lo que espera el AuthContext
    const userData = {
      user: {
        id: data.id,
        email: data.email,
        nombre_usuario: data.nombre_usuario,
        role: data.role,
        isBlocked: data.isBlocked,
        // Añadir otros campos necesarios
      }
    };

    console.log('Datos formateados:', userData); // Debug
    localStorage.setItem('user', JSON.stringify(userData.user));
    
    return userData;
  } catch (error) {
    console.error('Error en login:', error);
    throw error; // Propagar el error original para manejar el caso de usuario bloqueado
  }
};

/**
 * Cierra la sesión del usuario actual.
 */
export const logout = () => {
  try {
    localStorage.removeItem('user');
    console.log('Logout exitoso');
  } catch (error) {
    console.error('Error en logout:', error);
    throw new Error('Error al cerrar sesión');
  }
};

/**
 * Obtiene el usuario actual desde el token almacenado.
 * @returns {Promise<Object|null>} Datos del usuario o null si no hay sesión
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Verifica si el token actual es válido.
 * @returns {Promise<boolean>} true si el token es válido, false en caso contrario
 */
export const isAuthenticated = () => {
  try {
    const user = getUser();
    return !!user;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

/**
 * Registra un nuevo usuario.
 * @param {Object} userData - Datos del usuario a registrar
 * @param {string} userData.name - Nombre del usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario registrado
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar usuario');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verifica si el token actual es válido.
 * @returns {Promise<boolean>} true si el token es válido, false en caso contrario
 */
export const verifyToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene el usuario actual desde el token almacenado.
 * @returns {Promise<Object|null>} Datos del usuario o null si no hay sesión
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener datos del usuario');
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}; 
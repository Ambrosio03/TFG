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

export const logout = () => {
  try {
    localStorage.removeItem('user');
    console.log('Logout exitoso');
  } catch (error) {
    console.error('Error en logout:', error);
    throw new Error('Error al cerrar sesión');
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  try {
    const user = getUser();
    return !!user;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
}; 
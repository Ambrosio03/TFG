import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    bloqueados: 0,
    admins: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/home');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = () => {
    setLoading(true);
    fetch('http://localhost:8000/users', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        // Calcular estadísticas
        const stats = {
          total: data.length,
          activos: data.filter(u => !u.isBlocked).length,
          bloqueados: data.filter(u => u.isBlocked).length,
          admins: data.filter(u => u.role === 'ROLE_ADMIN').length
        };
        setStats(stats);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        toast.error('Error al cargar los usuarios');
        setLoading(false);
      });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Verificar si es el último administrador
      const currentUser = users.find(u => u.id === userId);
      if (currentUser.role === 'ROLE_ADMIN' && newRole === 'ROLE_CLIENTE') {
        const adminCount = users.filter(u => u.role === 'ROLE_ADMIN').length;
        if (adminCount <= 1) {
          toast.error('No se puede eliminar el último administrador');
          return;
        }
      }

      const formattedRole = newRole === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_CLIENTE';
      
      console.log('Enviando rol:', formattedRole); // Para depuración

      const response = await fetch(`http://localhost:8000/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          role: formattedRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData); // Para depuración
        throw new Error(errorData.error || 'Error al actualizar el rol');
      }
      
      toast.success('Rol actualizado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error al actualizar el rol del usuario');
    }
  };

  const handleBlockUser = async (userId, block) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isBlocked: block })
      });

      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      toast.success(block ? 'Usuario bloqueado correctamente' : 'Usuario desbloqueado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error updating block status:', error);
      toast.error('Error al actualizar el estado del usuario');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (user.username?.toLowerCase() || '').includes(searchTermLower) ||
      (user.email?.toLowerCase() || '').includes(searchTermLower) ||
      (user.role?.toLowerCase() || '').includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Administración de Usuarios</h1>
          <p className="mt-2 text-sm text-gray-600">Gestiona los usuarios de la plataforma</p>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Usuarios Activos</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activos}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Usuarios Bloqueados</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.bloqueados}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Administradores</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.admins}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Buscar usuarios</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Buscar usuarios..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {user.username}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {user.email}
                          </p>
                          <div className="sm:hidden mt-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.isBlocked ? 'Bloqueado' : 'Activo'}
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:block ml-4 flex-shrink-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isBlocked ? 'Bloqueado' : 'Activo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="w-full sm:w-auto">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="ROLE_CLIENTE">Cliente</option>
                          <option value="ROLE_ADMIN">Administrador</option>
                        </select>
                      </div>
                      <div className="w-full sm:w-auto">
                        <button
                          onClick={() => handleBlockUser(user.id, !user.isBlocked)}
                          className={`w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                            user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
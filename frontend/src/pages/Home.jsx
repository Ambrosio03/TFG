import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Home = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">TFG Project</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <>
                  <span className="text-gray-700">
                    Bienvenido, {user?.name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            {isAuthenticated() ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Bienvenido a tu Dashboard</h2>
                <p className="text-gray-600">
                  Has iniciado sesión correctamente. Aquí podrás ver el contenido de tu aplicación.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Bienvenido a TFG Project</h2>
                <p className="text-gray-600">
                  Por favor, inicia sesión para acceder a todas las funcionalidades.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 
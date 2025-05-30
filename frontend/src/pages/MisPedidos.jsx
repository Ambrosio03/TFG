import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPedidos();
  }, [user, navigate]);

  const fetchPedidos = () => {
    setLoading(true);
    fetch(`${API_URL}/pedidos/mis-pedidos/${user.id}`, {
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Respuesta del servidor:', data);
        if (!data || !data.pedidos || !Array.isArray(data.pedidos)) {
          throw new Error('La respuesta no contiene un array de pedidos');
        }
        setPedidos(data.pedidos);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching pedidos:', error);
        toast.error('Error al cargar los pedidos: ' + error.message);
        setLoading(false);
      });
  };

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
          <h1 className="text-3xl font-extrabold text-gray-900">Mis Pedidos</h1>
          <p className="mt-2 text-sm text-gray-600">Gestiona y revisa el estado de tus pedidos</p>
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tienes pedidos</h3>
              <p className="mt-2 text-sm text-gray-500">Aún no has realizado ningún pedido.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ver productos
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Historial de Pedidos</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Pedido #{pedido.id}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Realizado el {pedido.fecha_creacion ? new Date(pedido.fecha_creacion).toLocaleDateString() + ' a las ' + new Date(pedido.fecha_creacion).toLocaleTimeString() : 'Desconocida'}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Fecha de envío: {pedido.fecha_envio ? new Date(pedido.fecha_envio).toLocaleDateString() + ' a las ' + new Date(pedido.fecha_envio).toLocaleTimeString() : 'No ha sido enviado'}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Fecha de entrega: {pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString() + ' a las ' + new Date(pedido.fecha_entrega).toLocaleTimeString() : 'No ha sido entregado'}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                            pedido.estado === 'ENVIADO' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {pedido.estado}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">{pedido.total.toFixed(2)}€</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6">
                      <button
                        onClick={() => navigate(`/mis-pedidos/${pedido.id}`)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidos; 
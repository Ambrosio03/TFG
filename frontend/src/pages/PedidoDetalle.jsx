import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const PedidoDetalle = () => {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/home');
      return;
    }
    fetchPedido();
  }, [id, user, navigate]);

  const fetchPedido = () => {
    setLoading(true);
    fetch(`http://localhost:8000/pedidos/${id}`, {
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data || typeof data !== 'object') {
          throw new Error('La respuesta no es un pedido válido');
        }
        setPedido(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching pedido:', error);
        toast.error('Error al cargar los detalles del pedido: ' + error.message);
        setLoading(false);
      });
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ estado: newStatus })
      });

      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      toast.success('Estado actualizado correctamente');
      fetchPedido();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado del pedido');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Pedido no encontrado</h3>
              <p className="mt-2 text-sm text-gray-500">No se pudo encontrar el pedido solicitado.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/admin/pedidos')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Volver a pedidos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ... imports y hooks igual ...

return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Botón volver igual */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a pedidos
        </button>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Detalles del Pedido #{pedido.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información del pedido */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Información del Pedido</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <div className="mt-1">
                  <select
                    value={pedido.estado}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(pedido.fecha_creacion).toLocaleDateString()} a las {new Date(pedido.fecha_creacion).toLocaleTimeString()}
                </p>
              </div>
              {pedido.fecha_envio && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Envío</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(pedido.fecha_envio).toLocaleDateString()} a las {new Date(pedido.fecha_envio).toLocaleTimeString()}
                  </p>
                </div>
              )}
              {pedido.fecha_entrega && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Entrega</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(pedido.fecha_entrega).toLocaleDateString()} a las {new Date(pedido.fecha_entrega).toLocaleTimeString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{pedido.total.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Información del Cliente</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-indigo-600">
                    {pedido.usuario?.nombre_usuario?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{pedido.usuario?.nombre_usuario || 'N/A'}</h3>
                <p className="text-sm text-gray-500">{pedido.usuario?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pedido.items && pedido.items.length > 0 ? (
              pedido.items.map((producto) => (
                <div key={producto.id} className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-20 w-20">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre_producto}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{producto.nombre_producto}</h3>
                          <p className="mt-1 text-sm text-gray-500">Cantidad: {producto.cantidad}</p>
                        </div>
                        <p className="text-lg font-medium text-gray-900">{producto.precio_unitario.toFixed(2)}€</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No hay productos en este pedido.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default PedidoDetalle;

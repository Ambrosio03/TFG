import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const fetchCart = () => {
    if (!user) {
      setError('Debes iniciar sesión para ver tu carrito');
      return;
    }
    fetch(`${API_URL}/cart/${user.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar el carrito');
        }
        return response.json();
      })
      .then(data => {
        setCartItems(data.items || []);
        const total = (data.items || []).reduce((acc, item) => {
          const cantidad = Number(item.quantity) || 0;
          const precio = Number(item.product?.precio) || 0;
          return acc + cantidad * precio;
        }, 0);
        setTotal(total);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('No se pudo cargar el carrito. Por favor, intenta de nuevo más tarde.');
      });
  };

  useEffect(() => {
    if (!user) {
      setError('Debes iniciar sesión para ver tu carrito');
      return;
    }
    fetchCart();
    window.addEventListener('cart-updated', fetchCart);
    return () => window.removeEventListener('cart-updated', fetchCart);
  }, [user]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:8000/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: Number(newQuantity) })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cantidad');
      }

      toast.success('Cantidad actualizada');
      fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      toast.error('Error al actualizar la cantidad');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8000/cart/remove/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      toast.success('Producto eliminado del carrito');
      fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tu carrito está vacío
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Añade algunos productos para comenzar a comprar
            </p>
            <div className="mt-6">
              <Link
                to="/home"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Ver Productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  console.log(item.product);
                  return (
                    <li key={item.id} className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-24 h-24">
                          {item.product.imagenes && item.product.imagenes.length > 0 ? (
                            <img
                              src={`http://localhost:8000/images/products/${item.product.imagenes[0]}`}
                              alt={item.product.nombre}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.png';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400 italic h-24">
                              Sin imagen
                            </div>
                          )}
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.product.nombre}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.product.descripcion}
                              </p>
                            </div>
                            <p className="text-lg font-medium text-indigo-600">
                              {item.product.precio}€
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={item.quantity <= 1}
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="mx-4 text-gray-700">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-gray-900">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-medium text-indigo-600">{total.toFixed(2)}€</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      toast.error('Debes iniciar sesión para proceder al pago');
                      navigate('/login', { state: { from: '/checkout' } });
                    } else if (cartItems.length === 0) {
                      toast.error('Tu carrito está vacío');
                    } else {
                      navigate('/checkout');
                    }
                  }}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center block"
                >
                  Proceder al Pago
                </button>
                <Link
                  to="/home"
                  className="block text-center text-indigo-600 hover:text-indigo-500"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 
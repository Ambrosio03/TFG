import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de página del carrito de compras.
 * Muestra los productos añadidos al carrito y permite gestionar las cantidades.
 * Incluye el resumen del pedido y la opción de proceder al checkout.
 */
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Efecto que carga los items del carrito al montar el componente.
   * Obtiene los productos del carrito desde la API.
   */
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        setError('Debes iniciar sesión para ver tu carrito');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/cart/${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCartItems(data.items || []);
        const total = (data.items || []).reduce((acc, item) => {
          const cantidad = Number(item.quantity) || 0;
          const precio = Number(item.product?.precio) || 0;
          return acc + cantidad * precio;
        }, 0);
        setTotal(total);
        setError(null);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('No se pudieron cargar los items del carrito. Por favor, intente más tarde.');
      }
    };

    fetchCartItems();
    window.addEventListener('cart-updated', fetchCartItems);
    return () => window.removeEventListener('cart-updated', fetchCartItems);
  }, [user, API_URL]);

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * @param {number} productId - ID del producto a actualizar
   * @param {number} newQuantity - Nueva cantidad del producto
   */
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: itemId,
          quantity: newQuantity
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cantidad');
      }

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product_id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      toast.success('Cantidad actualizada');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Error al actualizar la cantidad');
    }
  };

  /**
   * Elimina un producto del carrito.
   * @param {number} productId - ID del producto a eliminar
   */
  const handleRemoveItem = async (itemId) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: itemId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      setCartItems(prevItems =>
        prevItems.filter(item => item.product_id !== itemId)
      );
      toast.success('Producto eliminado del carrito');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Error al eliminar el producto');
    }
  };

  /**
   * Calcula el total del carrito.
   * @returns {number} Total del carrito
   */
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product?.precio * item.quantity), 0);
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
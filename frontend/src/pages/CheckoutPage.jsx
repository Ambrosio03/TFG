import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { toast } from 'sonner';

/**
 * Componente de página de finalización de compra.
 * Permite al usuario completar su pedido con información de envío y pago.
 * Incluye validación de formularios y procesamiento del pedido.
 */
const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Efecto que carga los items del carrito al montar el componente.
   * Obtiene los productos del carrito desde la API.
   */
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        navigate('/login');
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
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, API_URL, navigate]);

  /**
   * Maneja los cambios en los campos del formulario.
   * Actualiza el estado del formulario con los nuevos valores.
   * @param {Event} e - Evento de cambio del input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Valida que todos los campos del formulario estén completos.
   * @returns {boolean} true si el formulario es válido, false en caso contrario
   */
  const validateForm = () => {
    return Object.values(formData).every(value => value.trim() !== '');
  };

  /**
   * Maneja el envío del formulario de checkout.
   * Procesa el pedido y redirige al usuario.
   * @param {Event} e - Evento de envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Por favor, complete todos los campos');
      return;
    }

    if (!user) {
      setError('Debes iniciar sesión para realizar un pedido');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          items: cartItems,
          total: total,
          paymentMethod,
          shipping_info: formData
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pedido');
      }

      const data = await response.json();
      toast.success('Pedido realizado con éxito');
      window.dispatchEvent(new Event('cart-updated'));
      navigate(`/mis-pedidos/${data.order_id}`);
    } catch (err) {
      console.error('Error processing order:', err);
      toast.error('Error al procesar el pedido');
      setError('Error al procesar el pedido. Por favor, intente más tarde.');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Calcula el total del pedido.
   * @returns {number} Total del pedido
   */
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.precio * item.quantity), 0);
  };

  if (loading) {
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
              <button
                onClick={() => navigate('/home')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Ver Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de pago */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Método de pago */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Método de Pago</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('credit')}
                        className={`relative rounded-lg border p-4 flex cursor-pointer focus:outline-none ${
                          paymentMethod === 'credit'
                            ? 'border-indigo-500 ring-2 ring-indigo-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">Tarjeta de Crédito</p>
                              <p className="text-gray-500">Pago seguro con tu tarjeta</p>
                            </div>
                          </div>
                          <svg
                            className={`h-5 w-5 ${
                              paymentMethod === 'credit' ? 'text-indigo-500' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`relative rounded-lg border p-4 flex cursor-pointer focus:outline-none ${
                          paymentMethod === 'paypal'
                            ? 'border-indigo-500 ring-2 ring-indigo-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">PayPal</p>
                              <p className="text-gray-500">Pago rápido y seguro</p>
                            </div>
                          </div>
                          <svg
                            className={`h-5 w-5 ${
                              paymentMethod === 'paypal' ? 'text-indigo-500' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Detalles de la tarjeta */}
                  {paymentMethod === 'credit' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                          Número de tarjeta
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                          Nombre en la tarjeta
                        </label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                            Fecha de expiración
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="MM/AA"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dirección de envío */}
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Dirección de Envío</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Dirección
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                            Código Postal
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                          País
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </div>
                      ) : (
                        'Realizar Pedido'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={`/images/${item.product.imagen}`}
                        alt={item.product.nombre}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{item.product.nombre}</h3>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {(item.product.precio * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{total.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-gray-900">Gratis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-medium text-indigo-600">{total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 
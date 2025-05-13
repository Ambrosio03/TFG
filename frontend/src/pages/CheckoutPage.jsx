import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost:8000/cart/${userId}`)
      .then(response => response.json())
      .then(data => {
        setCartItems(data.items || []);
        const total = (data.items || []).reduce((acc, item) => {
          const cantidad = Number(item.quantity) || 0;
          const precio = Number(item.product?.precio) || 0;
          return acc + cantidad * precio;
        }, 0);
        setTotal(total);
      })
      .catch(() => {
        setCartItems([]);
        navigate('/cart');
      });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí iría la lógica para procesar el pago
    alert('¡Gracias por tu compra!');
    navigate('/home');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <button
          onClick={() => navigate('/cart')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Volver al carrito
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resumen del pedido */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Resumen del pedido</h3>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.product.nombre} x {item.quantity}</span>
              <span>{(item.product.precio * item.quantity).toFixed(2)}€</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Formulario de pago */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Información de pago</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="credit">Tarjeta de crédito</option>
                <option value="debit">Tarjeta de débito</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {paymentMethod !== 'paypal' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre en la tarjeta
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de expiración
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de envío
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Calle y número"
                className="w-full p-2 border rounded mb-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ciudad"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="28001"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="España"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              Confirmar y pagar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 
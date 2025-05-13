import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchCart = () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
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
      .catch(() => setCartItems([]));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    fetch(`http://localhost:8000/cart/update/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: Number(newQuantity) })
    })
      .then(response => response.json())
      .then(() => {
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      })
      .catch(error => console.error('Error al actualizar cantidad:', error));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Tu Carrito</h2>
      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">El carrito está vacío</div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <img
                src={`/images/${item.product.imagen || 'default.jpg'}`}
                alt={item.product.nombre}
                className="w-24 h-24 object-cover rounded shadow"
                onError={e => { e.target.src = '/images/default.jpg'; }}
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{item.product.nombre}</h3>
                <p className="text-gray-600">{item.product.descripcion}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-500 text-sm">Cantidad:</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleUpdateQuantity(item.id, e.target.value)}
                    className="w-16 p-1 border rounded text-xs text-center"
                  />
                </div>
              </div>
              <div className="text-right">
                <span className="block text-lg font-bold text-green-600">{(item.product.precio * item.quantity).toFixed(2)}€</span>
                <span className="text-xs text-gray-400">({item.product.precio}€ c/u)</span>
              </div>
            </div>
          ))}
          <div className="flex justify-end items-center mt-6">
            <span className="text-xl font-semibold mr-4">Total:</span>
            <span className="text-2xl font-bold text-green-700">{total.toFixed(2)}€</span>
          </div>
        </div>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => navigate('/home')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Seguir comprando
        </button>
        {cartItems.length > 0 && (
          <button
            onClick={() => navigate('/checkout')}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
          >
            Proceder al pago
          </button>
        )}
      </div>
    </div>
  );
};

export default CartPage; 
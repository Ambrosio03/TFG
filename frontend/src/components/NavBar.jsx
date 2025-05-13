import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    console.log('Usuario antes de logout:', user);
    await fetch('http://localhost:8000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    logout();
    console.log('Usuario después de logout:', user);
    localStorage.clear();
    window.location.href = '/login';
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const handleRemoveItem = (itemId) => {
    fetch(`http://localhost:8000/cart/remove/${itemId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        window.dispatchEvent(new Event('cart-updated'));
      })
      .catch(error => console.error('Error al eliminar del carrito:', error));
  };

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
        window.dispatchEvent(new Event('cart-updated'));
      })
      .catch(error => console.error('Error al actualizar cantidad:', error));
  };

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const fetchCart = () => {
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
        });
    };

    fetchCart();
    window.addEventListener('cart-updated', fetchCart);
    return () => window.removeEventListener('cart-updated', fetchCart);
  }, [user]);

  useEffect(() => {
    console.log('Usuario en contexto (NavBar):', user);
  }, [user]);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl">Mi Aplicación</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-white font-semibold">
              Hola, {user.nombre_usuario}
            </span>
          )}
          <div className="flex space-x-4">
            {user?.role !== 'ROLE_ADMIN' && (
              <Link to="/home" className="text-white bg-green-500 px-4 py-2 rounded hover:bg-green-600">
                Inicio
              </Link>
            )}
            {user?.role === 'ROLE_ADMIN' && (
              <>
                <Link to="/admin" className="text-white bg-purple-500 px-4 py-2 rounded hover:bg-purple-600">
                  Administración  productos
                </Link>
                <Link to="/admin/users" className="text-white bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600">
                  Administrar Usuarios
                </Link>
              </>
            )}
            {user ? (
              <button onClick={handleLogout} className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600">
                Cerrar Sesión
              </button>
            ) : (
              <Link to="/login" className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
                Login
              </Link>
            )}
          </div>
        </div>
        {user?.role !== 'ROLE_ADMIN' && (
          <div className="relative">
            <button onClick={toggleCart} className="text-white focus:outline-none">
              <span className="material-icons">Mi carrito</span>
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">{cartItems.length}</span>
            </button>
            {showCart && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Mi Carrito</h3>
                  <Link to="/cart" className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm font-medium transition">Ver carrito</Link>
                </div>
                <ul className="p-4 max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {cartItems.length === 0 ? (
                    <li className="text-gray-500 text-center py-4">El carrito está vacío</li>
                  ) : (
                    cartItems.map(item => (
                      <li key={item.id} className="flex justify-between items-center py-2">
                        <div>
                          <span className="block font-medium text-gray-700">{item.product.nombre}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <label className="text-xs text-gray-400">Cantidad:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleUpdateQuantity(item.id, e.target.value)}
                              className="w-14 p-1 border rounded text-xs text-center"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">{(item.product.precio * item.quantity).toFixed(2)}€</span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                            title="Eliminar del carrito"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                <div className="px-4 py-3 border-t flex justify-between items-center bg-gray-50 rounded-b-lg">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className="font-bold text-lg text-green-700">{total.toFixed(2)}€</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

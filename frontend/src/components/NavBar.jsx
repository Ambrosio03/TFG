import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await fetch('http://localhost:8000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    logout();
    localStorage.clear();
    window.location.href = '/login';
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
    if (!user) return;

    const fetchCart = () => {
      fetch(`http://localhost:8000/cart/${user.id}`)
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
        .catch(error => console.error('Error fetching cart:', error));
    };

    fetchCart();
    window.addEventListener('cart-updated', fetchCart);
    return () => window.removeEventListener('cart-updated', fetchCart);
  }, [user]);

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex-shrink-0">
            <Link to="/home" className="text-white text-xl font-bold">
              Pasión Cofrade
            </Link>
          </div>

          {/* Menú hamburguesa para móvil */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menú principal - visible en desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <span className="text-white font-semibold px-3 py-2">
                Hola, {user.nombre_usuario}
              </span>
            )}
            {user?.role !== 'ROLE_ADMIN' && (
              <>
                <Link to="/home" className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition duration-150 ease-in-out">
                  Inicio
                </Link>
                <Link to="/mis-pedidos" className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition duration-150 ease-in-out">
                  Mis Pedidos
                </Link>
                <Link to="/cart" className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition duration-150 ease-in-out flex items-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItems.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user?.role === 'ROLE_ADMIN' && (
              <>
                <Link to="/admin" className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition duration-150 ease-in-out">
                  Administración
                </Link>
                <Link to="/admin/users" className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition duration-150 ease-in-out">
                  Usuarios
                </Link>
                <Link to="/admin/pedidos" className="text-white hover:bg-gray-700 px-3 py-2 rounded-md transition duration-150 ease-in-out">
                  Pedidos
                </Link>
              </>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="text-white hover:bg-red-600 px-3 py-2 rounded-md transition duration-150 ease-in-out"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white hover:bg-blue-600 px-3 py-2 rounded-md transition duration-150 ease-in-out"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <div className="text-white font-semibold px-3 py-2">
                Hola, {user.nombre_usuario}
              </div>
            )}
            {user?.role !== 'ROLE_ADMIN' && (
              <>
                <Link
                  to="/home"
                  className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/mis-pedidos"
                  className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mis Pedidos
                </Link>
                <Link
                  to="/cart"
                  className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Carrito
                  {cartItems.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user?.role === 'ROLE_ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Administración
                </Link>
                <Link
                  to="/admin/users"
                  className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Usuarios
                </Link>
                <Link
                  to="/admin/pedidos"
                  className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pedidos
                </Link>
              </>
            )}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="text-white hover:bg-red-600 block w-full text-left px-3 py-2 rounded-md"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

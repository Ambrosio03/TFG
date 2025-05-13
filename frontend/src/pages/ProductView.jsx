import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulación de fetch para obtener el producto
    fetch(`http://localhost:8000/product/${id}`)
      .then(response => response.json())
      .then(data => setProducto(data))
      .catch(error => console.error('Error fetching product:', error));
  }, [id]);

  const handleAddToCart = () => {
    if (!user || !user.id) {
      console.error('Usuario no autenticado');
      return;
    }

    if (user.role === 'ROLE_ADMIN') {
      navigate('/admin');
      return;
    }

    const userId = localStorage.getItem('user_id');
    fetch('http://localhost:8000/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: producto.id,
        quantity: cantidad,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Producto añadido al carrito:', data);
        window.dispatchEvent(new Event('cart-updated'));
      })
      .catch(error => console.error('Error al añadir al carrito:', error));
  };

  if (!producto) return <div>Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden flex">
        <img src={`/images/${producto.imagen}`} alt={producto.nombre} className="w-1/3 h-auto object-cover" />
        <div className="p-4 w-2/3">
          <h2 className="text-2xl font-bold mb-2">{producto.nombre}</h2>
          <p className="text-gray-700 mb-4">{producto.descripcion}</p>
          <p className="text-green-500 font-semibold mb-4">Precio: {producto.precio}€</p>
          {user?.role !== 'ROLE_ADMIN' && (
            <>
              <div className="flex items-center mb-4">
                <label className="mr-2">Cantidad:</label>
                <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="border rounded p-1 w-16" min="1" />
              </div>
              <button onClick={handleAddToCart} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Añadir al Carrito
              </button>
            </>
          )}
          {user?.role === 'ROLE_ADMIN' && (
            <button 
              onClick={() => navigate('/admin')} 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Ir a Administración
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductView; 
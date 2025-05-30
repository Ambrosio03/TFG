import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const ProductView = () => {
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/product/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar el producto');
        }
        return response.json();
      })
      .then(data => {
        setProducto(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('No se pudo cargar el producto. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      });
  }, [id, API_URL]);

  const handleAddToCart = async (product, quantity) => {
    if (!user) {
      toast.error('Debes iniciar sesión para añadir productos al carrito');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          quantity: parseInt(quantity)
        })
      });

      if (!response.ok) {
        throw new Error('Error al añadir al carrito');
      }

      toast.success('Producto añadido al carrito');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      toast.error('Error al añadir el producto al carrito');
    }
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

  if (!producto) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Galería de imágenes */}
            <div className="space-y-4">
              <div className="w-full h-96">
                <img
                  src={`${API_URL}/images/products/${producto.imagenes[selectedImage]}`}
                  alt={producto.nombre}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.png';
                  }}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {producto.imagenes.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden h-24 ${
                      selectedImage === index ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <img
                      src={`${API_URL}/images/products/${img}`}
                      alt={`${producto.nombre} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{producto.nombre}</h1>
                <p className="mt-2 text-2xl text-indigo-600 font-bold">{producto.precio}€</p>
              </div>

              <div className="prose prose-sm text-gray-500">
                <p>{producto.descripcion}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Características</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Alta calidad</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Envío rápido</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Garantía de devolución</span>
                  </div>
                </div>
              </div>

              {user?.role !== 'ROLE_ADMIN' && (
                <div className="border-t border-gray-200 pt-6">
                  {producto.stock === 0 ? (
                    <div className="text-red-500 font-bold mb-4">No hay stock disponible</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <label htmlFor="cantidad" className="mr-4 text-sm font-medium text-gray-700">
                          Cantidad:
                        </label>
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            id="cantidad"
                            value={cantidad}
                            onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 text-center border-0 focus:ring-0"
                            min="1"
                            max={producto.stock}
                          />
                          <button
                            onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="ml-4 text-sm text-gray-500">
                          {producto.stock} disponibles
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(producto, cantidad)}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Añadir al Carrito
                      </button>
                    </div>
                  )}
                </div>
              )}

              {user?.role === 'ROLE_ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Ir a Administración
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView; 
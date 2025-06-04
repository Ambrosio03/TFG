import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useCart } from '../contexts/CartContext';

/**
 * Componente de vista detallada de un producto.
 * Muestra toda la información del producto, incluyendo imágenes, descripción y opciones de compra.
 * Permite añadir el producto al carrito y ver sus detalles completos.
 */
const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Efecto que carga los datos del producto al montar el componente.
   * Obtiene la información del producto desde la API.
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/product/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('No se pudo cargar el producto. Por favor, intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_URL]);

  /**
   * Maneja el cambio de imagen seleccionada.
   * @param {number} index - Índice de la nueva imagen seleccionada
   */
  const handleImageChange = (index) => {
    setSelectedImage(index);
  };

  /**
   * Maneja el cambio en la cantidad del producto.
   * @param {Event} e - Evento de cambio del input
   */
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  /**
   * Maneja la adición del producto al carrito.
   * Añade el producto con la cantidad seleccionada al carrito.
   */
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
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

  if (!product) return null;

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
                  src={`${API_URL}/images/products/${product.imagenes[selectedImage]}`}
                  alt={product.nombre}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.png';
                  }}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.imagenes.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`relative rounded-lg overflow-hidden h-24 ${
                      selectedImage === index ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <img
                      src={`${API_URL}/images/products/${img}`}
                      alt={`${product.nombre} ${index + 1}`}
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
                <h1 className="text-3xl font-extrabold text-gray-900">{product.nombre}</h1>
                <p className="mt-2 text-2xl text-indigo-600 font-bold">{product.precio}€</p>
              </div>

              <div className="prose prose-sm text-gray-500">
                <p>{product.descripcion}</p>
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
                  {product.stock === 0 ? (
                    <div className="text-red-500 font-bold mb-4">No hay stock disponible</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <label htmlFor="cantidad" className="mr-4 text-sm font-medium text-gray-700">
                          Cantidad:
                        </label>
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            id="cantidad"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="w-16 text-center border-0 focus:ring-0"
                            min="1"
                            max={product.stock}
                          />
                          <button
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="ml-4 text-sm text-gray-500">
                          {product.stock} disponibles
                        </span>
                      </div>

                      <button
                        onClick={handleAddToCart}
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    visible: true
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/home');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = () => {
    fetch('http://localhost:8000/product/all')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingProduct 
      ? `http://localhost:8000/product/${editingProduct.id}`
      : 'http://localhost:8000/product';
    
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el producto');
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const response = await fetch(`http://localhost:8000/product/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al eliminar el producto');
      fetchProducts();
    } catch (error) {
      alert('Error al eliminar el producto');
    }
  };

  const handleToggleVisibility = async (productId, currentVisibility) => {
    try {
      const response = await fetch(`http://localhost:8000/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la visibilidad');
      }

      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      visible: true
    });
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Administración de Productos</h1>
      
      {/* Formulario de producto */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Imagen</label>
            <input
              type="text"
              name="imagen"
              value={formData.imagen}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="visible"
              checked={formData.visible}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Visible</label>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingProduct ? 'Actualizar' : 'Crear'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.precio}€</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.visible ? 'Visible' : 'Oculto'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="text-red-600 hover:text-red-900 mr-4"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(product.id, product.visible)}
                    className={`${
                      product.visible ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {product.visible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`http://localhost:8000/product/${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingProduct),
                  });
                  if (!response.ok) throw new Error('Error al actualizar el producto');
                  setShowModal(false);
                  setEditingProduct(null);
                  fetchProducts();
                } catch (error) {
                  alert('Error al guardar cambios');
                }
              }}
              className="space-y-4"
            >
              <input
                type="text"
                value={editingProduct.nombre}
                onChange={e => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nombre"
                required
              />
              <input
                type="number"
                value={editingProduct.precio}
                onChange={e => setEditingProduct({ ...editingProduct, precio: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Precio"
                required
              />
              <input
                type="number"
                value={editingProduct.stock}
                onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Stock"
                required
              />
              <input
                type="text"
                value={editingProduct.imagen}
                onChange={e => setEditingProduct({ ...editingProduct, imagen: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Imagen"
                required
              />
              <textarea
                value={editingProduct.descripcion}
                onChange={e => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Descripción"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingProduct(null); }}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">¿Eliminar producto?</h2>
            <div className="mb-4">
              <p><strong>Nombre:</strong> {productToDelete.nombre}</p>
              <p><strong>Descripción:</strong> {productToDelete.descripcion}</p>
              <p><strong>Precio:</strong> {productToDelete.precio} €</p>
              <p><strong>Stock:</strong> {productToDelete.stock}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`http://localhost:8000/product/${productToDelete.id}`, {
                      method: 'DELETE',
                      credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Error al eliminar el producto');
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                    fetchProducts();
                  } catch (error) {
                    alert('Error al eliminar el producto');
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 
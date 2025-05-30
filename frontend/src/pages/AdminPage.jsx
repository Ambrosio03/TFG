import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: 0,
    visible: true,
    imagenes: []
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const { user } = useAuth();
  console.log('user en AdminPage:', user);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [selectedCsvFile, setSelectedCsvFile] = useState(null);

  useEffect(() => {
    console.log('user en useEffect AdminPage:', user);
    if (!user || user.role !== 'ROLE_ADMIN') {
      navigate('/home');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_URL}/product/all`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        // Calcular estadísticas
        const totalValue = data.reduce((acc, product) => acc + (product.precio * product.stock), 0);
        const lowStock = data.filter(product => product.stock < 5 && product.stock > 0).length;
        const outOfStock = data.filter(product => product.stock === 0).length;
        
        setStats({
          totalProducts: data.length,
          lowStock,
          outOfStock,
          totalValue
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setError('Error al cargar los productos');
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length !== 4) {
      toast.error('Debes seleccionar exactamente 4 imágenes');
      return;
    }

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Solo se permiten imágenes en formato JPEG, PNG o WEBP');
      return;
    }

    setSelectedImages(files);

    // Crear URLs de vista previa
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Solo validar imágenes si es un nuevo producto
    if (!editingProduct && selectedImages.length !== 4) {
      toast.error('Debes seleccionar exactamente 4 imágenes');
      return;
    }

    // Validación de stock
    if (formData.stock < 0) {
      setError('El stock no puede ser negativo');
      return;
    }

    const url = editingProduct 
      ? `${API_URL}/product/${editingProduct.id}`
      : `${API_URL}/product`;
    
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      let base64Images = [];
      
      // Solo procesar imágenes si se han seleccionado nuevas
      if (selectedImages.length > 0) {
        const imagePromises = selectedImages.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        base64Images = await Promise.all(imagePromises);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          stock: formData.stock,
          imagenes: base64Images.length > 0 ? base64Images : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el producto');
      }

      toast.success(editingProduct ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
      fetchProducts();
      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`${API_URL}/product/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editingProduct.nombre,
          descripcion: editingProduct.descripcion,
          precio: editingProduct.precio,
          stock: editingProduct.stock
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      setShowModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const response = await fetch(`${API_URL}/product/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al eliminar el producto');
      fetchProducts();
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleToggleVisibility = async (productId, currentVisibility) => {
    try {
      const response = await fetch(`${API_URL}/product/${productId}`, {
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
      stock: 0,
      visible: true,
      imagenes: []
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      visible: product.visible
    });
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      visible: product.visible,
      imagenes: []
    });
    setShowModal(true);
  };

  const filteredProducts = products.filter(product => {
    if (!product) return false;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (product.nombre?.toLowerCase() || '').includes(searchTermLower) ||
      (product.descripcion?.toLowerCase() || '').includes(searchTermLower) ||
      (product.categoria?.toLowerCase() || '').includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Panel de Administración</h1>
          <p className="mt-2 text-sm text-gray-600">Gestiona tus productos y visualiza estadísticas</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Productos</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalProducts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Stock Bajo</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.lowStock}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sin Stock</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.outOfStock}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.totalValue.toFixed(2)}€</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        

        {/* Formulario de creación de productos SIEMPRE visible */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mb-8 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imágenes {!editingProduct && '(4 requeridas)'}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {editingProduct 
                    ? 'Opcional: Selecciona nuevas imágenes para actualizar las existentes'
                    : 'Selecciona exactamente 4 imágenes en formato JPEG, PNG o WEBP'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="visible"
                checked={formData.visible}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Visible</label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingProduct ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>

        {/* Importación de CSV */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mb-8 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Importar Productos desde CSV</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Archivo CSV
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedCsvFile(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
                {selectedCsvFile && (
                  <button
                    onClick={async () => {
                      const formData = new FormData();
                      formData.append('file', selectedCsvFile);

                      try {
                        const response = await fetch(`${API_URL}/product/import-csv`, {
                          method: 'POST',
                          body: formData,
                          credentials: 'include'
                        });

                        if (!response.ok) {
                          throw new Error('Error al importar el archivo CSV');
                        }

                        const result = await response.json();
                        toast.success(`Se importaron ${result.imported} productos correctamente`);
                        fetchProducts();
                        setSelectedCsvFile(null);
                      } catch (error) {
                        toast.error('Error al importar el archivo CSV: ' + error.message);
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Importar
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                El archivo CSV debe tener las siguientes columnas: nombre, descripcion, precio, stock, visible
              </p>
              <a
                href="/template.csv"
                download
                className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar plantilla CSV
              </a>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Buscar productos</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar productos..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Productos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th scope="col" className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th scope="col" className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.imagenes && product.imagenes.length > 0 
                                ? `${API_URL}/images/products/${product.imagenes[0]}`
                                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMjAgMTVDMjIuNzYxNCAxNSAyNSAxMi43NjE0IDI1IDEwQzI1IDcuMjM4NTggMjIuNzYxNCA1IDIwIDVDMTcuMjM4NiA1IDE1IDcuMjM4NTggMTUgMTBDMTUgMTIuNzYxNCAxNy4yMzg2IDE1IDIwIDE1WiIgZmlsbD0iIzlDQThBQiIvPjxwYXRoIGQ9Ik0yMCAxOEMxNS41ODE3IDE4IDEyIDIxLjU4MTcgMTIgMjZIMjhDMjggMjEuNTgxNyAyNC40MTgzIDE4IDIwIDE4WiIgZmlsbD0iIzlDQThBQiIvPjwvc3ZnPg=='}
                              alt={product.nombre}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMjAgMTVDMjIuNzYxNCAxNSAyNSAxMi43NjE0IDI1IDEwQzI1IDcuMjM4NTggMjIuNzYxNCA1IDIwIDVDMTcuMjM4NiA1IDE1IDcuMjM4NTggMTUgMTBDMTUgMTIuNzYxNCAxNy4yMzg2IDE1IDIwIDE1WiIgZmlsbD0iIzlDQThBQiIvPjxwYXRoIGQ9Ik0yMCAxOEMxNS41ODE3IDE4IDEyIDIxLjU4MTcgMTIgMjZIMjhDMjggMjEuNTgxNyAyNC40MTgzIDE4IDIwIDE4WiIgZmlsbD0iIzlDQThBQiIvPjwvc3ZnPg==';
                                e.target.className = 'h-10 w-10 rounded-full object-cover bg-gray-200';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">{product.descripcion}</div>
                            <div className="md:hidden mt-2 space-y-1">
                              <div className="text-sm text-gray-900">Precio: {product.precio}€</div>
                              <div className={`text-sm ${
                                product.stock === 0 ? 'text-red-600' :
                                product.stock < 5 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                Stock: {product.stock}
                                {product.stock < 5 && product.stock > 0 && ' (¡Stock bajo!)'}
                              </div>
                              <div className="text-sm">
                                Estado: <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.visible ? 'Visible' : 'Oculto'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.precio}€</div>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock < 5 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {product.stock < 5 && product.stock > 0 && (
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        <span className="font-medium">{product.stock}</span>
                        {product.stock < 5 && product.stock > 0 && (
                          <span className="ml-2 text-sm">¡Stock bajo!</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.visible ? 'Visible' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="text-red-600 hover:text-red-900"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de edición */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Imágenes {!editingProduct && '(4 requeridas)'}
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageChange}
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {editingProduct 
                        ? 'Opcional: Selecciona nuevas imágenes para actualizar las existentes'
                        : 'Selecciona exactamente 4 imágenes en formato JPEG, PNG o WEBP'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Visible</label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de eliminación */}
        {showDeleteModal && productToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-4 text-center text-red-600">¿Eliminar producto?</h2>
              <div className="mb-4 text-center">
                <p className="text-gray-600">¿Estás seguro de que deseas eliminar este producto?</p>
                <p className="font-medium mt-2">{productToDelete.nombre}</p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`${API_URL}/product/${productToDelete.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (!response.ok) throw new Error('Error al eliminar el producto');
                      toast.success('Producto eliminado con éxito');
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                      fetchProducts();
                    } catch (error) {
                      toast.error('Error al eliminar el producto');
                    }
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
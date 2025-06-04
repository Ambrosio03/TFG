import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProductView from '../pages/ProductView';
import CartPage from '../pages/CartPage';
import AdminPage from '../pages/AdminPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminPedidosPage from '../pages/AdminPedidosPage';
import PedidoDetalle from '../pages/PedidoDetalle';
import MisPedidos from '../pages/MisPedidos';
import MisPedidoDetalle from '../pages/MisPedidoDetalle';
import ErrorPage from '../pages/ErrorPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import CustomLayout from '../layouts/CustomLayout';
import CheckoutPage from '../pages/CheckoutPage';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';

/**
 * Componente raíz que envuelve la aplicación con los providers necesarios.
 * Proporciona el contexto de autenticación y usuario a toda la aplicación.
 */
const Root = () => {
  return (
    <UserProvider>
      <AuthProvider>
        <CustomLayout />
      </AuthProvider>
    </UserProvider>
  );
};

/**
 * Configuración de rutas de la aplicación.
 * Define las rutas públicas y protegidas, así como sus componentes asociados.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/home',
        element: <HomePage />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/product/:id',
        element: <ProductView />
      },
      {
        path: '/cart',
        element: <ProtectedRoute><CartPage /></ProtectedRoute>
      },
      {
        path: '/checkout',
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>
      },
      {
        path: '/mis-pedidos',
        element: <ProtectedRoute><MisPedidos /></ProtectedRoute>
      },
      {
        path: '/mis-pedidos/:id',
        element: <ProtectedRoute><MisPedidoDetalle /></ProtectedRoute>
      },
      {
        path: '/admin',
        element: <ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>
      },
      {
        path: '/admin/users',
        element: <ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>
      },
      {
        path: '/admin/pedidos',
        element: <ProtectedRoute requireAdmin><AdminPedidosPage /></ProtectedRoute>
      },
      {
        path: '/admin/pedidos/:id',
        element: <ProtectedRoute requireAdmin><PedidoDetalle /></ProtectedRoute>
      }
    ]
  },
  {
    path: '*',
    element: <ErrorPage errorCode={404} title="Página no encontrada" message="La página que buscas no existe." />
  }
]); 
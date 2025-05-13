import { createBrowserRouter, Navigate } from 'react-router-dom';
import CustomLayout from '../layouts/CustomLayout';
import ErrorPage from '../pages/ErrorPage';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import FavoritesPages from '../pages/FavoritesPages';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProductView from '../pages/ProductView';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import AdminPage from '../pages/AdminPage';
import AdminUsersPage from '../pages/AdminUsersPage';


export const router = createBrowserRouter([
  {
    element: <CustomLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/home',
        element: <HomePage />,
      },
      {
        path: '/favorites',
        element: <FavoritesPages />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/product/:id',
        element: <ProductView />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
      {
        path: '/admin/users',
        element: <AdminUsersPage />,
      },
      {
        path: '*',
        element: <Navigate to="/home" replace />,
      },
    ],
  },
]); 
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";

/**
 * Layout personalizado que envuelve las páginas de la aplicación.
 * Proporciona una estructura común con la barra de navegación y el pie de página.
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar
 */
const CustomLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Mi Tienda. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomLayout;

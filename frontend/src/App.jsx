import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { Toaster } from "sonner";

/**
 * Componente principal de la aplicación.
 * Configura el router y el sistema de notificaciones toast.
 * Sirve como punto de entrada principal de la aplicación.
 */
const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" duration={2000} />
    </>
  );
};

export default App;
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" duration={2000} />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;

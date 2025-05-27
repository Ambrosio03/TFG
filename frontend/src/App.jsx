import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from './context/UserContext';


const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <Toaster position="top-right" duration={2000} />
        <RouterProvider router={router} />
      </UserProvider>
    </AuthProvider>
  );
};

export default App;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error en el inicio de sesión');
      }
  
      if (data.isBlocked) {
        setShowBanModal(true);
        setIsLoading(false);
        return;
      }
  
      await login(data); // Guarda los datos del usuario directamente
  
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={isLoading}
          className="w-full p-2 mb-4 border border-gray-300 rounded disabled:bg-gray-100"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={isLoading}
          className="w-full p-2 mb-4 border border-gray-300 rounded disabled:bg-gray-100"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Iniciando sesión...' : 'Login'}
        </button>
        <p className="mt-4 text-center">
          ¿No tienes una cuenta? <a href="/register" className="text-blue-500 hover:underline">Regístrate aquí</a>
        </p>
      </form>

      {showBanModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">No puedes iniciar sesión</h2>
            <p className="mb-6">Has sido baneado por un administrador.</p>
            <button
              onClick={() => {
                setShowBanModal(false);
                navigate('/login');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
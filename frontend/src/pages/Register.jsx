import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        window.location.href = '/home';
      } else {
        console.error('Error during registration:', data);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-600">Registro</h2>
      <input
        type="text"
        name="nombre_usuario"
        value={formData.nombre_usuario}
        onChange={handleChange}
        placeholder="Nombre de usuario"
        required
        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Contraseña"
        required
        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button type="submit" className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">Registrar</button>
    </form>
  );
}

export default Register;
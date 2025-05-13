import React, { useEffect, useState } from 'react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    const url = query
      ? `http://localhost:8000/users?search=${encodeURIComponent(query)}`
      : 'http://localhost:8000/users';
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchUsers(e.target.value);
  };

  const handleRoleChange = async (id, newRole) => {
    await fetch(`http://localhost:8000/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers(search);
  };

  const handleBlockToggle = async (id, currentBlocked) => {
    await fetch(`http://localhost:8000/users/${id}/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !currentBlocked })
    });
    fetchUsers(search);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Administrar Usuarios</h1>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Buscar por nombre..."
        className="mb-4 p-2 border rounded w-full max-w-md"
      />
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.nombre_usuario}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="ROLE_CLIENTE">Cliente</option>
                    <option value="ROLE_ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  {user.isBlocked ? (
                    <span className="text-red-600 font-bold">Bloqueado</span>
                  ) : (
                    <span className="text-green-600 font-bold">Activo</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleBlockToggle(user.id, user.isBlocked)}
                    className={`px-3 py-1 rounded ${user.isBlocked ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsersPage;
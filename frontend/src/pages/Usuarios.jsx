import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, Mail, Trash2, User, Key } from 'lucide-react';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idRol, setIdRol] = useState('');

  const cargarDatos = async () => {
    try {
      const resU = await fetch('http://192.168.18.28:4000/api/usuarios');
      const dataU = await resU.json();
      setUsuarios(dataU);

      const resR = await fetch('http://192.168.18.28:4000/api/roles');
      const dataR = await resR.json();
      setRoles(dataR);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrar = async (e) => {
    e.preventDefault();
    if (!idRol) return alert("Selecciona un rol");

    try {
      const res = await fetch('http://192.168.18.28:4000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, id_rol: idRol })
      });

      if (res.ok) {
        alert("Usuario registrado");
        setNombre(''); setEmail(''); setPassword(''); setIdRol('');
        cargarDatos();
      }
    } catch (error) {
      alert("Error en el servidor");
    }
  };

  const eliminar = async (id) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      await fetch(`http://192.168.18.28:4000/api/usuarios/${id}`, { method: 'DELETE' });
      cargarDatos();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* FORMULARIO */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-indigo-600 mb-6 flex items-center gap-2">
            <UserPlus /> Nuevo Empleado
          </h2>
          <form onSubmit={registrar} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required 
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required 
              />
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required 
              />
            </div>
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
              <select 
                className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                value={idRol} onChange={e => setIdRol(e.target.value)} required
              >
                <option value="">Seleccionar Rol</option>
                {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
              </select>
            </div>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Crear Usuario
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <Users className="text-indigo-500" /> Personal Activo
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {usuarios.map((u) => (
              <div key={u.id_usuario} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 leading-tight">{u.nombre}</p>
                    <p className="text-[11px] text-gray-400">{u.email}</p>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white border border-gray-200 rounded-md text-indigo-500">
                      {u.nombre_rol}
                    </span>
                  </div>
                </div>
                <button onClick={() => eliminar(u.id_usuario)} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
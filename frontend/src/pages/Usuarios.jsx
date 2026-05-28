import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, Mail, Trash2, User, Key, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast'; // 🔥 REGLA DE ORO

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idRol, setIdRol] = useState('');

  const cargarDatos = async () => {
    try {
      // Endpoint de usuarios unificado
      const resU = await fetch('https://nuevo-98vm.onrender.com/api/usuarios');
      if (resU.ok) {
        const dataU = await resU.json();
        // BLINDAJE: Nos aseguramos de que siempre sea un arreglo válido
        setUsuarios(Array.isArray(dataU) ? dataU : []);
      }

      // Endpoint de roles unificado
      const resR = await fetch('https://nuevo-98vm.onrender.com/api/roles');
      if (resR.ok) {
        const dataR = await resR.json();
        // BLINDAJE: Nos aseguramos de que siempre sea un arreglo válido
        setRoles(Array.isArray(dataR) ? dataR : []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al sincronizar datos del servidor"); // ✅ Manejo de error visual
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrar = async (e) => {
    e.preventDefault();
    if (!idRol) return toast.error("Por favor, selecciona un rol"); // ✅

    const cargandoToast = toast.loading("Registrando usuario..."); // 🔥 Feedback de carga

    try {
      // Endpoint de registro unificado
      const res = await fetch('https://nuevo-98vm.onrender.com/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, id_rol: idRol })
      });

      toast.dismiss(cargandoToast); // Ocultar carga

      if (res.ok) {
        toast.success("¡Usuario registrado con éxito! 👤"); // ✅
        setNombre(''); setEmail(''); setPassword(''); setIdRol('');
        cargarDatos();
      } else {
        toast.error("Error al registrar el usuario"); // ✅
      }
    } catch (error) {
      toast.dismiss(cargandoToast);
      toast.error("Error de conexión con el servidor"); // ✅
    }
  };

  const eliminar = async (id) => {
    // Mantenemos el confirm nativo por seguridad antes de borrar
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      const cargandoToast = toast.loading("Eliminando..."); // 🔥 Feedback de eliminación

      try {
        // Endpoint de eliminación unificado
        const res = await fetch(`https://nuevo-98vm.onrender.com/api/usuarios/${id}`, { method: 'DELETE' });
        
        toast.dismiss(cargandoToast);

        if (res.ok) {
          toast.success("Usuario eliminado correctamente"); // ✅
          cargarDatos();
        } else {
          toast.error("Error al eliminar el usuario"); // ✅
        }
      } catch (error) {
        toast.dismiss(cargandoToast);
        toast.error("Error de conexión"); // ✅
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row gap-6 items-start">
        
        {/* LISTA DE PERSONAL ACTIVO (ARRIBA EN MÓVILES) */}
        <div className="flex-1 w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-white">
            <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-gray-950 tracking-tight">
              <Users className="text-indigo-600 shrink-0" size={20} /> Personal Activo
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {usuarios.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-400 col-span-2 text-center py-8 font-medium">
                No hay empleados registrados activos.
              </p>
            ) : (
              usuarios.map((u) => (
                <div key={u.id_usuario || u.id} className="p-4 bg-gray-50/60 rounded-xl sm:rounded-2xl border border-gray-100 flex justify-between items-center gap-2 transition-all hover:border-gray-200">
                  <div className="flex gap-3 min-w-0 items-center">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shrink-0 invisible sm:visible sm:block">
                      <User size={18} />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
                        {u.nombre || "Sin Nombre"}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{u.email || "Sin Correo"}</p>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-white border border-gray-200 rounded-md text-indigo-600 mt-1 inline-block">
                        {u.nombre_rol || u.rol || 'Empleado'}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => eliminar(u.id_usuario || u.id)} 
                    className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    title="Eliminar usuario"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FORMULARIO DE REGISTRO (ABAJO EN MÓVILES) */}
        <div className="w-full lg:w-80 xl:w-96 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-6 shrink-0">
          <h2 className="text-base sm:text-lg font-black text-gray-950 mb-4 flex items-center gap-2">
            <UserPlus className="text-indigo-600 shrink-0" size={20} /> Nuevo Empleado
          </h2>
          
          <form onSubmit={registrar} className="space-y-3.5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium transition-all"
                placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required 
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium transition-all"
                placeholder="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required 
              />
            </div>
            
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium transition-all"
                placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required 
              />
            </div>
            
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
              <select 
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium transition-all appearance-none cursor-pointer relative z-0"
                value={idRol} onChange={e => setIdRol(e.target.value)} required
              >
                <option value="">Seleccionar Rol</option>
                {roles.map(r => (
                  <option key={r.id_rol || r.id} value={r.id_rol || r.id}>
                    {r.nombre_rol || r.nombre || "Rol Desconocido"}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md active:scale-95 mt-2">
              Crear Usuario
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Usuarios;
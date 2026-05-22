import React, { useState, useEffect } from 'react';
import { ShieldCheck, Shield, Plus, Loader2 } from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // 1. Cargar los roles desde Render (URL corregida)
  const cargarRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/roles');
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error("Error al cargar roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    cargarRoles(); 
  }, []);

  // 2. Crear un nuevo Rol en la base de datos (Opcional, para expandir tu personal)
  const manejarCrearRol = async (e) => {
    e.preventDefault();
    if (!nuevoRol.trim()) return;

    try {
      setGuardando(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_rol: nuevoRol })
      });

      if (res.ok) {
        alert("¡Nuevo rol creado con éxito! 🛡️");
        setNuevoRol('');
        cargarRoles(); // Recargar la lista
      } else {
        alert("Error al crear el rol. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error creando rol:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* LADO IZQUIERDO: CREAR O ADMINISTRAR ROLES */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
            <Shield /> Gestionar Niveles
          </h2>
          <p className="text-gray-500 text-xs mb-6 leading-relaxed">
            Los roles definen qué empleados pueden cobrar, ver reportes de dinero o modificar el inventario de licores.
          </p>

          <form onSubmit={manejarCrearRol} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                Nombre del Nuevo Rol
              </label>
              <input 
                type="text"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-sm"
                placeholder="Ej: Administrador, Cajero..." 
                value={nuevoRol} 
                onChange={e => setNuevoRol(e.target.value)} 
                required 
              />
            </div>
            <button 
              disabled={guardando}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:bg-indigo-300"
            >
              {guardando ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Plus size={18} /> Guardar Rol
                </>
              )}
            </button>
          </form>
        </div>

        {/* LADO DERECHO: VISTA DE ROLES CONFIGURADOS */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Encabezado */}
          <div className="p-6 border-b bg-indigo-600 flex items-center gap-3">
            <ShieldCheck className="text-white" size={28} />
            <div>
              <h2 className="text-xl font-bold text-white">Roles y Permisos</h2>
              <p className="text-indigo-100 text-sm">Niveles de acceso configurados para Licores Nicole</p>
            </div>
          </div>

          {/* Lista de Roles */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <span className="text-sm">Sincronizando permisos...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No hay roles configurados en el sistema.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {roles.map((rol) => (
                  <div key={rol.id_rol} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-sm">
                        {rol.id_rol}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg block">{rol.nombre_rol}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Shield size={12} /> Acceso habilitado
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      Activo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Roles;
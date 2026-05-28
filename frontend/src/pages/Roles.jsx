import React, { useState, useEffect } from 'react';
import { ShieldCheck, Shield, Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // 🔥 REGLA DE ORO

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // 1. Cargar los roles desde Render
  const cargarRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/roles');
      if (res.ok) {
        const data = await res.json();
        // BLINDAJE: Garantizamos que siempre sea un array válido
        setRoles(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error al cargar roles:", err);
      toast.error("Error al sincronizar roles del servidor"); // ✅ Manejo de error visual
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    cargarRoles(); 
  }, []);

  // 2. Crear un nuevo Rol en la base de datos
  const manejarCrearRol = async (e) => {
    e.preventDefault();
    if (!nuevoRol.trim()) return toast.error("Ingresa un nombre para el rol"); // ✅ Validación visual

    const cargandoToast = toast.loading("Creando nivel de acceso..."); // 🔥 Feedback de carga

    try {
      setGuardando(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_rol: nuevoRol })
      });

      toast.dismiss(cargandoToast); // Ocultar carga

      if (res.ok) {
        toast.success("¡Nuevo rol creado con éxito! 🛡️"); // ✅ Éxito
        setNuevoRol('');
        cargarRoles(); // Recargar la lista
      } else {
        toast.error("Error al crear el rol. Intenta de nuevo."); // ✅ Error del servidor
      }
    } catch (error) {
      toast.dismiss(cargandoToast);
      console.error("Error creando rol:", error);
      toast.error("Error de conexión con el servidor."); // ✅ Error de red
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* DISTRIBUCIÓN ADAPTABLE (FORMULARIO ABAJO O AL LADO DEPENDIENDO DE LA PANTALLA) */}
      <div className="flex flex-col-reverse lg:flex-row gap-6 items-start">
        
        {/* LADO DERECHO (AHORA ARRIBA EN MÓVILES): VISTA DE ROLES CONFIGURADOS */}
        <div className="flex-1 w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Encabezado */}
          <div className="p-4 sm:p-6 border-b bg-indigo-600 flex items-center gap-3">
            <ShieldCheck className="text-white shrink-0" size={26} />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Roles y Permisos</h2>
              <p className="text-indigo-100 text-xs sm:text-sm">Niveles de acceso configurados para Licores Nicole</p>
            </div>
          </div>

          {/* Lista de Roles */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 className="animate-spin text-indigo-600" size={28} />
                <span className="text-xs uppercase font-bold tracking-widest text-[10px]">Sincronizando permisos...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs sm:text-sm font-medium">
                No hay roles configurados en el sistema.
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                {roles.map((rol) => (
                  <div key={rol.id_rol} className="flex items-center justify-between p-4 bg-gray-50/60 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-base sm:text-xl shadow-sm shrink-0">
                        {rol.id_rol}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 text-sm sm:text-base block truncate">
                          {rol.nombre_rol || "Rol sin nombre"}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Shield size={10} /> Acceso habilitado
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 ml-2">
                      Activo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LADO IZQUIERDO (AHORA ABAJO EN MÓVILES): CREAR O ADMINISTRAR ROLES */}
        <div className="w-full lg:w-80 xl:w-96 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-6 shrink-0">
          <h2 className="text-base sm:text-lg font-black text-gray-950 mb-2 flex items-center gap-2">
            <Shield className="text-indigo-600 shrink-0" size={20} /> Gestionar Niveles
          </h2>
          <p className="text-gray-400 text-xs mb-4 sm:mb-6 leading-relaxed">
            Los roles definen qué empleados pueden cobrar, ver reportes de dinero o modificar el inventario de licores.
          </p>

          <form onSubmit={manejarCrearRol} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Nombre del Nuevo Rol
              </label>
              <input 
                type="text"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs sm:text-sm transition-all"
                placeholder="Ej: Administrador, Cajero..." 
                value={nuevoRol} 
                onChange={e => setNuevoRol(e.target.value)} 
              />
            </div>
            <button 
              disabled={guardando}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:bg-indigo-300"
            >
              {guardando ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Plus size={16} /> Guardar Rol
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Roles;
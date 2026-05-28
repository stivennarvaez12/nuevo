import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, UserCheck, Phone, IdCard, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // 1. Cargar la lista completa de clientes desde el Backend
  const cargarClientes = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/clientes');
      if (res.ok) {
        const data = await res.json();
        setClientes(Array.isArray(data) ? data : []);
      } else {
        toast.error("No se pudo sincronizar la lista de clientes");
      }
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      toast.error("Error de conexión al cargar la base de clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // 2. Registrar un nuevo cliente
  const manejarCrearCliente = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !cedula.trim()) {
      return toast.error("El nombre y la cédula son obligatorios");
    }

    try {
      setGuardando(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, cedula, telefono })
      });

      if (res.ok) {
        toast.success("¡Cliente registrado con éxito! 👥");
        setNombre(''); 
        setCedula(''); 
        setTelefono('');
        cargarClientes(); // Recargar la lista inmediatamente
      } else {
        toast.error("Error al registrar el cliente. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error creando cliente:", error);
      toast.error("Error de red al intentar registrar el cliente");
    } finally {
      setGuardando(false);
    }
  };

  // 3. Eliminar cliente
  const eliminarCliente = async (id, nombreCliente) => {
    if (window.confirm(`¿Seguro que deseas eliminar al cliente "${nombreCliente}"?`)) {
      try {
        const res = await fetch(`https://nuevo-98vm.onrender.com/api/clientes/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success("Cliente eliminado correctamente");
          cargarClientes();
        } else {
          toast.error("No se pudo eliminar el cliente seleccionado");
        }
      } catch (error) {
        toast.error("Error de conexión al intentar eliminar");
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row gap-6 items-start">
        
        {/* 📋 LISTA DE CLIENTES REGISTRADOS */}
        <div className="flex-1 w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-gray-950 tracking-tight">
                <Users className="text-gray-950 shrink-0" size={20} /> Base de Clientes
              </h2>
              <p className="text-xs text-gray-400 font-medium">Lista detallada de compradores registrados</p>
            </div>
            {/* Indicador de cantidad total estilo Licores Nicole */}
            <span className="bg-amber-50 text-amber-800 font-black text-xs px-3 py-1.5 rounded-lg border border-amber-100 shadow-sm">
              {clientes.length} {clientes.length === 1 ? 'Cliente' : 'Clientes'}
            </span>
          </div>
          
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 className="animate-spin text-amber-500" size={28} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Buscando en el sistema...</span>
              </div>
            ) : clientes.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-400 text-center py-8 font-medium">
                No hay clientes registrados en el sistema.
              </p>
            ) : (
              <>
                {/* 💻 VISTA PARA COMPUTADORA (Tabla Tradicional) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100">
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</th>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Documento / Cédula</th>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono</th>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {clientes.map((c) => (
                        <tr key={c.id_cliente || c.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-gray-900 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            {c.nombre || "Sin Nombre"}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-gray-600 text-sm">
                            {c.cedula || c.documento || "—"}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-gray-600 text-sm">
                            {c.telefono || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button 
                              onClick={() => eliminarCliente(c.id_cliente || c.id, c.nombre)} 
                              className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Eliminar cliente"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 📱 VISTA PARA CELULARES (Tarjetas Independientes Táctiles) */}
                <div className="block md:hidden space-y-3">
                  {clientes.map((c) => (
                    <div key={c.id_cliente || c.id} className="p-4 bg-white rounded-xl border border-gray-100 flex justify-between items-center gap-2 shadow-sm">
                      <div className="min-w-0 space-y-1">
                        <p className="font-bold text-gray-950 text-sm truncate">
                          {c.nombre || "Sin Nombre"}
                        </p>
                        
                        <div className="flex flex-col gap-0.5 text-[11px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <IdCard size={12} className="text-gray-400 shrink-0" /> C.C: {c.cedula || c.documento || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-gray-400 shrink-0" /> Tel: {c.telefono || "—"}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => eliminarCliente(c.id_cliente || c.id, c.nombre)} 
                        className="text-red-400 hover:text-red-600 p-2.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ➕ FORMULARIO PARA REGISTRAR NUEVO CLIENTE */}
        <div className="w-full lg:w-80 xl:w-96 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-6 shrink-0">
          <h2 className="text-base sm:text-lg font-black text-gray-950 mb-4 flex items-center gap-2">
            <UserPlus className="text-gray-950 shrink-0" size={20} /> Nuevo Cliente
          </h2>
          
          <form onSubmit={manejarCrearCliente} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-gray-950 text-xs sm:text-sm font-medium transition-all"
                  placeholder="Ej: Juan Pérez" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cédula / NIT</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-gray-950 text-xs sm:text-sm font-medium transition-all"
                  placeholder="Ej: 10203040" 
                  value={cedula} 
                  onChange={e => setCedula(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Teléfono Celular</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="tel"
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-gray-950 text-xs sm:text-sm font-medium transition-all"
                  placeholder="Ej: 3101234567" 
                  value={telefono} 
                  onChange={e => setTelefono(e.target.value)} 
                />
              </div>
            </div>
            
            <button 
              disabled={guardando}
              className="w-full py-3 bg-gray-950 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-900 transition-all shadow-md active:scale-95 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {guardando ? <Loader2 className="animate-spin" size={16} /> : "Registrar Cliente"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Clientes;
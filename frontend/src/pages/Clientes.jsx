import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Mail, IdCard, MapPin, Loader2 } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar clientes desde el servidor
  const fetchClientes = async () => {
    try {
      const response = await fetch('https://nuevo-98vm.onrender.com/api/clientes');
      if (!response.ok) throw new Error("Error en la respuesta");
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Registrar un nuevo cliente
  const registrarCliente = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      return alert("El nombre del cliente es obligatorio.");
    }

    try {
      const response = await fetch('https://nuevo-98vm.onrender.com/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, documento, telefono, correo, direccion })
      });

      if (response.ok) {
        alert("¡Cliente registrado con éxito!");
        setNombre('');
        setDocumento('');
        setTelefono('');
        setCorreo('');
        setDireccion('');
        fetchClientes(); 
      } else {
        const errorData = await response.json();
        console.error("Error del backend:", errorData);
        alert("Error al registrar el cliente. Revisa la consola.");
      }
    } catch (error) {
      console.error("Error de red/conexión:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-screen lg:h-[calc(100vh-6rem)] pb-28 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PANEL IZQUIERDO: FORMULARIO (Se acopla arriba en celular, al lado en PC) */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 h-fit">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-blue-50">
          <h2 className="text-lg sm:text-xl font-bold text-blue-900 flex items-center gap-2">
            <UserPlus className="text-blue-500" size={20} />
            Nuevo Cliente
          </h2>
          <p className="text-xs sm:text-sm text-blue-700/70 mt-1">Registra los datos para tus próximos domicilios.</p>
        </div>

        <form onSubmit={registrarCliente} className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Documento (CC/NIT)</label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Ej. 1020304050" 
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Ej. 300 123 4567" 
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="email" 
                placeholder="Ej. juan@correo.com" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Dirección de Entrega</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Ej. Calle 10 # 20-30" 
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md mt-4"
          >
            <UserPlus size={18} />
            Guardar Cliente
          </button>
        </form>
      </div>

      {/* PANEL DERECHO: DIRECTORIO (Scroll inteligente controlado) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[50vh] lg:h-full overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-gray-500" />
            Directorio de Clientes
          </h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-black text-xs shadow-sm">
            Total: {clientes.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50/30">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-2 py-10">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <span className="text-xs font-medium">Sincronizando base de datos...</span>
            </div>
          ) : clientes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-10">
              <Users size={36} className="opacity-20" />
              <p className="text-xs font-medium">Aún no hay clientes registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {clientes.map((cliente) => (
                <div 
                  key={cliente?.id_cliente || cliente?.id} 
                  className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all flex flex-col gap-2.5 shadow-sm"
                >
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2 truncate">
                    <div className="bg-blue-50 text-blue-500 p-1.5 rounded-full shrink-0">
                      <Users size={14}/>
                    </div>
                    <span className="truncate">{cliente?.nombre || "Cliente Sin Nombre"}</span>
                  </h4>
                  
                  <div className="text-xs text-gray-500 space-y-1.5 pl-8 font-medium">
                    {cliente?.documento && (
                      <p className="flex items-center gap-2 truncate"><IdCard size={13} className="text-gray-400 shrink-0"/> CC/NIT: {cliente.documento}</p>
                    )}
                    {cliente?.telefono && (
                      <p className="flex items-center gap-2 truncate"><Phone size={13} className="text-gray-400 shrink-0"/> {cliente.telefono}</p>
                    )}
                    {cliente?.correo && (
                      <p className="flex items-center gap-2 truncate"><Mail size={13} className="text-gray-400 shrink-0"/> {cliente.correo}</p>
                    )}
                    {cliente?.direccion && (
                      <p className="flex items-center gap-2 text-blue-600 font-bold truncate"><MapPin size={13} className="text-blue-400 shrink-0"/> {cliente.direccion}</p>
                    )}
                    {!cliente?.documento && !cliente?.telefono && !cliente?.correo && !cliente?.direccion && (
                      <p className="italic text-gray-400 text-[11px]">Sin datos adicionales</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
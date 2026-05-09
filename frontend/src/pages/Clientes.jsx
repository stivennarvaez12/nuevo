import { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Mail, IdCard, MapPin } from 'lucide-react';

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
      const response = await fetch('http://192.168.18.28:4000/api/clientes');
      if (!response.ok) throw new Error("Error en la respuesta");
      const data = await response.json();
      setClientes(data);
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
      const response = await fetch('http://192.168.18.28:4000/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // AHORA ENVIAMOS LA DIRECCIÓN AL BACKEND
        body: JSON.stringify({ nombre, documento, telefono, correo, direccion })
      });

      if (response.ok) {
        alert("¡Cliente registrado con éxito!");
        setNombre('');
        setDocumento('');
        setTelefono('');
        setCorreo('');
        setDireccion('');
        fetchClientes(); // Recargar la lista automáticamente
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
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PANEL IZQUIERDO: FORMULARIO */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-fit">
        <div className="p-5 border-b border-gray-100 bg-blue-50">
          <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <UserPlus className="text-blue-500" />
            Nuevo Cliente
          </h2>
          <p className="text-sm text-blue-700/70 mt-1">Registra los datos para tus próximos domicilios.</p>
        </div>

        <form onSubmit={registrarCliente} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Documento (CC/NIT)</label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Ej. 1020304050" 
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Ej. 300 123 4567" 
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="Ej. juan@correo.com" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección de Entrega</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Ej. Calle 10 # 20-30" 
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md mt-4"
          >
            <UserPlus size={20} />
            Guardar Cliente
          </button>
        </form>
      </div>

      {/* PANEL DERECHO: DIRECTORIO DE CLIENTES */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-gray-500" />
            Directorio
          </h2>
          <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-lg font-bold shadow-sm text-sm">
            Total: {clientes.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="text-center text-gray-400 py-10 animate-pulse">Cargando directorio...</div>
          ) : clientes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-10">
              <Users size={48} className="opacity-20" />
              <p className="text-sm font-medium">Aún no hay clientes registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientes.map((cliente) => (
                <div key={cliente.id_cliente} className="p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <div className="bg-blue-50 text-blue-500 p-2 rounded-full">
                      <Users size={16}/>
                    </div>
                    {cliente.nombre}
                  </h4>
                  <div className="text-sm text-gray-500 space-y-2 mt-1 pl-10 font-medium">
                    {cliente.documento && (
                      <p className="flex items-center gap-2"><IdCard size={14} className="text-gray-400"/> CC/NIT: {cliente.documento}</p>
                    )}
                    {cliente.telefono && (
                      <p className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {cliente.telefono}</p>
                    )}
                    {cliente.correo && (
                      <p className="flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {cliente.correo}</p>
                    )}
                    {cliente.direccion && (
                      <p className="flex items-center gap-2 text-blue-600"><MapPin size={14} className="text-blue-400"/> {cliente.direccion}</p>
                    )}
                    {!cliente.documento && !cliente.telefono && !cliente.correo && !cliente.direccion && (
                      <p className="italic text-gray-400">Sin datos de contacto adicionales</p>
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
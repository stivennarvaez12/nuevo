import { useState, useEffect } from 'react';
import { TrendingDown, PlusCircle, DollarSign, FileText, Calendar, ReceiptText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- CONFIGURACIÓN DE LA URL (Consistente con la Bodega) ---
const RAW_URL = import.meta.env.VITE_API_URL || 'https://nuevo-98vm.onrender.com';
const API_URL = RAW_URL.replace(/\/$/, ""); // Quitamos el slash final si existe

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Cargar historial de gastos desde el servidor
  const fetchGastos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/gastos`);
      
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      
      const data = await response.json();
      setGastos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar gastos:", error);
      toast.error("Error al sincronizar el historial de egresos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  // 2. Registrar un nuevo gasto
  const registrarGasto = async (e) => {
    e.preventDefault();
    
    if (!descripcion.trim() || !monto || Number(monto) <= 0) {
      return toast.error("Ingresa una descripción y un monto mayor a 0");
    }

    const idUsuario = Number(localStorage.getItem('id_usuario')) || 1; 
    const cargandoToast = toast.loading("Registrando gasto...");

    try {
      const response = await fetch(`${API_URL}/api/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idUsuario,
          descripcion: descripcion.trim(),
          monto: Number(monto),
          categoria: "General" // 🔥 SOLUCIÓN: Satisface la exigencia de la columna 'categoria' en el Backend
        })
      });

      toast.dismiss(cargandoToast);

      if (response.ok) {
        toast.success("¡Gasto registrado con éxito! 💸");
        setDescripcion(''); 
        setMonto('');
        fetchGastos(); // Recargamos la lista automáticamente
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Detalle del servidor:", errorData);
        toast.error("El servidor rechazó el registro del gasto");
      }
    } catch (error) {
      toast.dismiss(cargandoToast);
      console.error("Error en la transacción:", error);
      toast.error("Error de conexión con el servidor");
    }
  };

  // Evita valores nulos o indefinidos que puedan romper la suma total
  const totalGastos = gastos.reduce((sum, item) => sum + Number(item.monto || 0), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-screen lg:h-[calc(100vh-6rem)] pb-28 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PANEL IZQUIERDO: FORMULARIO DE GASTOS */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 h-fit">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-red-50">
          <h2 className="text-lg sm:text-xl font-black text-red-900 flex items-center gap-2">
            <TrendingDown className="text-red-500" size={20} />
            Registrar Gasto
          </h2>
          <p className="text-xs sm:text-sm text-red-700/70 font-medium mt-0.5">Ingresa los egresos operativos del negocio.</p>
        </div>

        <form onSubmit={registrarGasto} className="p-4 sm:p-5 space-y-4">
          {/* Input Descripción */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Descripción del Gasto</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Ej. Recibo de luz, Arriendo, Hielo..." 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-xs sm:text-sm font-medium text-gray-900"
                required
              />
            </div>
          </div>

          {/* Input Monto */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Monto ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="number" 
                placeholder="Ej. 50000" 
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-xs sm:text-sm font-black text-gray-900"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md mt-2"
          >
            <PlusCircle size={18} />
            Guardar Gasto
          </button>
        </form>
      </div>

      {/* PANEL DERECHO: HISTORIAL DE GASTOS */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[50vh] lg:h-full overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <ReceiptText size={18} className="text-gray-500" />
            Historial de Egresos
          </h2>
          <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-black text-xs sm:text-sm shadow-sm shrink-0 border border-red-200">
            Total: ${totalGastos.toLocaleString('es-CO')}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50/20">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-3 py-10">
              <Loader2 className="animate-spin text-red-500" size={28} />
              <span className="text-xs font-bold tracking-wider uppercase">Sincronizando egresos...</span>
            </div>
          ) : gastos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-10">
              <TrendingDown size={40} className="opacity-20" />
              <p className="text-xs font-bold tracking-wider uppercase">Aún no hay gastos registrados.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {gastos.map((gasto, index) => (
                <div 
                  key={gasto.id_gasto || gasto.id || index} 
                  className="flex justify-between items-center p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow shadow-sm gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-red-50 text-red-500 p-2 sm:p-3 rounded-xl shrink-0 border border-red-100">
                      <TrendingDown size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{gasto.descripcion}</h4>
                      <div className="flex items-center text-[10px] text-gray-400 mt-1 gap-1 font-bold uppercase tracking-wider">
                        <Calendar size={11} />
                        <span className="truncate">
                          {gasto.fecha || gasto.fecha_gasto ? (
                            new Date(gasto.fecha || gasto.fecha_gasto).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'short', timeStyle: 'short' })
                          ) : (
                            "Fecha no disponible"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-red-600 text-sm sm:text-base whitespace-nowrap">
                      -${Number(gasto.monto || 0).toLocaleString('es-CO')}
                    </span>
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
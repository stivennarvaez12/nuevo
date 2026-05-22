import { useState, useEffect } from 'react';
import { TrendingDown, PlusCircle, DollarSign, FileText, Calendar, ReceiptText } from 'lucide-react';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar historial de gastos desde el servidor - URL Estandarizada
  const fetchGastos = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://nuevo-98vm.onrender.com/api/gastos');
      if (response.ok) {
        const data = await response.json();
        setGastos(data);
      }
    } catch (error) {
      console.error("Error al cargar gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  // Registrar un nuevo gasto
  const registrarGasto = async (e) => {
    e.preventDefault();
    
    if (!descripcion.trim() || !monto || Number(monto) <= 0) {
      return alert("Por favor, ingresa una descripción válida y un monto mayor a 0.");
    }

    const idUsuario = localStorage.getItem('id_usuario') || 1; 

    try {
      const response = await fetch('https://nuevo-98vm.onrender.com/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idUsuario,
          descripcion: descripcion,
          monto: Number(monto)
        })
      });

      if (response.ok) {
        alert("¡Gasto registrado con éxito! 💸");
        setDescripcion(''); 
        setMonto('');
        fetchGastos(); 
      } else {
        alert("Error al registrar el gasto en la base de datos.");
      }
    } catch (error) {
      console.error("Error en la transacción:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  // Calcular el total de dinero gastado
  const totalGastos = gastos.reduce((sum, item) => sum + Number(item.monto), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PANEL IZQUIERDO: FORMULARIO DE GASTOS */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-fit">
        <div className="p-5 border-b border-gray-100 bg-red-50">
          <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
            <TrendingDown className="text-red-500" />
            Registrar Gasto
          </h2>
          <p className="text-sm text-red-700/70 mt-1">Ingresa los egresos operativos del negocio.</p>
        </div>

        <form onSubmit={registrarGasto} className="p-5 space-y-5">
          {/* Input Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción del Gasto</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Ej. Recibo de luz, Arriendo, Hielo..." 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Input Monto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Monto ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="number" 
                placeholder="Ej. 50000" 
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm font-bold"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md mt-4"
          >
            <PlusCircle size={20} />
            Guardar Gasto
          </button>
        </form>
      </div>

      {/* PANEL DERECHO: HISTORIAL DE GASTOS */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ReceiptText size={20} className="text-gray-500" />
            Historial de Egresos
          </h2>
          <div className="bg-red-100 text-red-800 px-4 py-1.5 rounded-lg font-bold shadow-sm">
            Total: ${totalGastos.toLocaleString('es-CO')}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="text-center text-gray-400 py-10 animate-pulse">Cargando historial...</div>
          ) : gastos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-10">
              <TrendingDown size={48} className="opacity-20" />
              <p className="text-sm font-medium">Aún no hay gastos registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gastos.map((gasto, index) => (
                <div key={gasto.id || gasto.id_gasto || index} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl">
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{gasto.descripcion}</h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                        <Calendar size={12} />
                        {gasto.fecha || gasto.fecha_gasto ? (
                          new Date(gasto.fecha || gasto.fecha_gasto).toLocaleString('es-CO')
                        ) : (
                          "Fecha no disponible"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-red-600 text-lg">
                      -${Number(gasto.monto).toLocaleString('es-CO')}
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
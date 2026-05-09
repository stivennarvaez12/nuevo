import { useState, useEffect } from 'react';
import { PackageCheck, Calendar, DollarSign } from 'lucide-react';

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await fetch('http://192.168.18.28:4000/api/compras');
        if (response.ok) {
          const data = await response.json();
          setCompras(data);
        }
      } catch (error) {
        console.error("Error al cargar el historial de compras:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-5 border-b border-gray-100 bg-indigo-50 flex items-center gap-3">
        <div className="bg-indigo-600 text-white p-2 rounded-lg">
          <PackageCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-indigo-900">Historial de Compras</h2>
          <p className="text-sm text-indigo-700/70 mt-1">Registro histórico de todas las entradas de mercancía al inventario.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-50/30">
        {loading ? (
          <div className="text-center text-gray-400 py-10 animate-pulse font-medium">Cargando historial de compras...</div>
        ) : compras.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 space-y-4 py-16 h-full">
            <PackageCheck size={56} className="opacity-20 text-indigo-500" />
            <p className="text-sm font-medium">Aún no hay compras registradas en el sistema.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {compras.map((compra) => (
              <div key={compra.id_compra} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className="bg-indigo-50 text-indigo-600 px-4 py-3 rounded-xl font-black text-lg border border-indigo-100 group-hover:scale-105 transition-transform">
                    #{compra.id_compra}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-md">Orden de Ingreso</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1.5 gap-1.5 font-medium">
                      <Calendar size={14} className="text-indigo-400" />
                      {new Date(compra.fecha_compra).toLocaleString('es-CO')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Inversión Total</span>
                  <span className="font-black text-gray-900 text-xl flex items-center gap-1 justify-end">
                    <DollarSign size={18} className="text-indigo-500"/>
                    {Number(compra.total_compra).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
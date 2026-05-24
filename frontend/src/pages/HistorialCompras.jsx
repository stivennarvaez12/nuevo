import React, { useState, useEffect } from 'react';
import { PackageCheck, Calendar, DollarSign, Loader2 } from 'lucide-react';

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await fetch('https://nuevo-98vm.onrender.com/api/compras');
        if (response.ok) {
          const data = await response.json();
          setCompras(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al cargar el historial de compras:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
  }, []);

  // Función interna para formatear fechas de forma segura
  const formatearFecha = (fechaOriginal) => {
    if (!fechaOriginal) return "Fecha no disponible";
    const fecha = new Date(fechaOriginal);
    return isNaN(fecha.getTime()) 
      ? "Fecha inválida" 
      : fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-screen lg:h-[calc(100vh-6rem)] pb-28 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Encabezado adaptable */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-indigo-50 flex items-center gap-3">
        <div className="bg-indigo-600 text-white p-2 rounded-lg shrink-0">
          <PackageCheck size={20} sm={24} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-indigo-900">Historial de Compras</h2>
          <p className="text-xs sm:text-sm text-indigo-700/70 mt-0.5">Registro histórico de todas las entradas de mercancía al inventario.</p>
        </div>
      </div>

      {/* Cuerpo con Scroll inteligente */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50/30">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400 flex-col gap-2 animate-pulse">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
            <span className="text-xs font-medium">Cargando historial de compras...</span>
          </div>
        ) : compras.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 space-y-3 py-16 h-full">
            <PackageCheck size={44} className="opacity-20 text-indigo-500" />
            <p className="text-xs sm:text-sm font-medium">Aún no hay compras registradas en el sistema.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:gap-4">
            {compras.map((compra) => (
              <div 
                key={compra?.id_compra || compra?.id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all group gap-3 shadow-sm"
              >
                {/* Bloque Izquierdo: ID de Orden e información base */}
                <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
                  <div className="bg-indigo-50 text-indigo-600 h-10 w-12 sm:h-12 sm:w-16 flex items-center justify-center rounded-xl font-black text-sm sm:text-lg border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                    #{compra?.id_compra || compra?.id || '000'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 text-xs sm:text-base">Orden de Ingreso</h4>
                    <div className="flex items-center text-[11px] sm:text-sm text-gray-400 mt-0.5 sm:mt-1.5 gap-1 sm:gap-1.5 font-medium truncate">
                      <Calendar size={12} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{formatearFecha(compra?.fecha_compra || compra?.fecha)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Bloque Derecho: Totales de Inversión (Alineado o auto-ajustado) */}
                <div className="text-left sm:text-right pt-2.5 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Inversión Total</span>
                  <span className="font-black text-gray-900 text-base sm:text-xl flex items-center gap-0.5">
                    <DollarSign size={14} className="text-indigo-500 sm:size-[18px]"/>
                    {Number(compra?.total_compra || compra?.total || 0).toLocaleString('es-CO')}
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
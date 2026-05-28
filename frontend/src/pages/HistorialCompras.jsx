import React, { useState, useEffect } from 'react';
import { PackageCheck, Calendar, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await fetch('https://nuevo-98vm.onrender.com/api/compras');
        if (response.ok) {
          const data = await response.json();
          const arrayCompras = Array.isArray(data) ? data : (data.data || []);
          setCompras(arrayCompras);
        } else {
          toast.error("Error al sincronizar el historial con el servidor");
        }
      } catch (error) {
        console.error("Error al cargar el historial de compras:", error);
        toast.error("Error de conexión al cargar las compras");
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
  }, []);

  // Formateador anti-desfases de zonas ISO string
  const formatearFechaSecura = (fechaOriginal) => {
    if (!fechaOriginal) return "Fecha no disponible";
    
    const partes = fechaOriginal.split(" ");
    if (partes.length >= 1) {
      const subPartesFecha = partes[0].split("-");
      if (subPartesFecha.length === 3) {
        const año = subPartesFecha[0];
        const mes = subPartesFecha[1];
        const dia = subPartesFecha[2];
        const hora = partes[1] ? partes[1].substring(0, 5) : '';
        return `${dia}/${mes}/${año} ${hora ? '• ' + hora : ''}`;
      }
    }
    
    const fecha = new Date(fechaOriginal);
    return isNaN(fecha.getTime()) 
      ? "Fecha inválida" 
      : fecha.toLocaleString('es-CO', { dateStyle: 'short' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[80vh] lg:h-[calc(100vh-6rem)] pb-28 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Encabezado */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 flex items-center gap-3">
        <div className="bg-gray-950 text-amber-400 p-2 rounded-xl shrink-0 shadow-sm">
          <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">Historial de Compras</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Registro histórico de todas las entradas de mercancía al inventario.</p>
        </div>
      </div>

      {/* Listado */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50/20">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400 flex-col gap-2">
            <Loader2 className="animate-spin text-amber-500" size={24} />
            <span className="text-xs font-medium">Sincronizando libros de compras...</span>
          </div>
        ) : compras.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 space-y-3 py-16 h-full">
            <PackageCheck size={44} className="text-gray-200" />
            <p className="text-xs sm:text-sm font-bold">Aún no hay compras registradas en el sistema.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:gap-3 max-w-5xl mx-auto">
            {compras.map((compra) => {
              const idCompra = compra?.id_compra || compra?.id || '000';
              return (
                <div 
                  key={idCompra} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-amber-200 hover:shadow-sm transition-all group gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="bg-gray-950 text-amber-400 h-10 w-14 sm:h-11 sm:w-16 flex items-center justify-center rounded-xl font-black text-xs sm:text-sm shadow-sm shrink-0 transition-transform group-hover:scale-102">
                      #{idCompra}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                        Orden de Suministro
                        <ArrowRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline" />
                      </h4>
                      <div className="flex items-center text-[11px] text-gray-400 mt-1 gap-1.5 font-medium">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{formatearFechaSecura(compra?.fecha_compra || compra?.fecha)}</span>
                        {compra.id_usuario && (
                          <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.2 rounded ml-1">ID Op: {compra.id_usuario}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Inversión Recibida</span>
                    <span className="font-black text-emerald-600 text-sm sm:text-base flex items-center">
                      <DollarSign size={13} className="text-emerald-600 shrink-0" />
                      {Number(compra?.total_compra || compra?.total || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
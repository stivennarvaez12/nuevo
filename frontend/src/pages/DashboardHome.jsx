import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Users, AlertTriangle, TrendingUp, Award, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- CONFIGURACIÓN DE LA URL (Consistente con Bodega y Gastos) ---
const RAW_URL = import.meta.env.VITE_API_URL || 'https://nuevo-98vm.onrender.com';
const API_URL = RAW_URL.replace(/\/$/, ""); // Eliminamos el slash final si existe

export default function DashboardHome() {
  const [statsData, setStatsData] = useState({
    totalIngresos: 0,
    totalProductos: 0,
    totalClientes: 0,
    alertasStock: [],
    topProductos: [],
    topClientes: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      {/* 🔥 SOLUCIÓN: Cambiado a '${API_URL}/dashboard' removiendo el '/api' que causaba el error 404 */}
      const response = await fetch(`${API_URL}/dashboard`);
      
      if (response.ok) {
        const data = await response.json();
        setStatsData({
          totalIngresos: data?.totalIngresos ?? 0,
          totalProductos: data?.totalProductos ?? 0,
          totalClientes: data?.totalClientes ?? 0,
          alertasStock: Array.isArray(data?.alertasStock) ? data.alertasStock : [],
          topProductos: Array.isArray(data?.topProductos) ? data.topProductos : [],
          topClientes: Array.isArray(data?.topClientes) ? data.topClientes : []
        });
      } else {
        toast.error("No se pudieron actualizar las métricas del panel");
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      toast.error("Error de conexión con el centro de datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const listaAlertas = statsData.alertasStock || [];
  const topProductos = (statsData.topProductos || []).slice(0, 10);
  const topClientes = (statsData.topClientes || []).slice(0, 10);

  const maxVentas = topProductos.length > 0 
    ? Math.max(...topProductos.map(p => Number(p.ventas || p.cantidad || 0))) 
    : 100;

  const stats = [
    { 
      title: 'Ventas Totales', 
      value: loading ? '...' : `$${Number(statsData.totalIngresos).toLocaleString('es-CO')}`, 
      icon: <DollarSign size={16} className="text-emerald-600" />, 
      bg: 'bg-emerald-50 border border-emerald-100/50' 
    },
    { 
      title: 'Licores en Catálogo', 
      value: loading ? '...' : Number(statsData.totalProductos).toString(), 
      icon: <Package size={16} className="text-amber-600" />, 
      bg: 'bg-amber-50 border border-amber-100/50' 
    },
    { 
      title: 'Alertas Stock', 
      value: loading ? '...' : listaAlertas.length.toString(), 
      icon: <AlertTriangle size={16} className={listaAlertas.length > 0 ? "text-red-600" : "text-gray-400"} />, 
      bg: listaAlertas.length > 0 ? 'bg-red-50 border border-red-100/50' : 'bg-gray-50 border border-gray-100' 
    },
    { 
      title: 'Clientes Miembros', 
      value: loading ? '...' : Number(statsData.totalClientes).toString(), 
      icon: <Users size={16} className="text-gray-900" />, 
      bg: 'bg-gray-100 border border-gray-200/50' 
    },
  ];

  return (
    <div className="space-y-5 p-1 sm:p-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight bg-gradient-to-r from-gray-950 to-amber-700 bg-clip-text text-transparent">
          La Cava Central
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
          Perspectiva premium y analíticas en tiempo real de Licores Nicole.
        </p>
      </div>

      {/* Rejilla de datos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-2.5 rounded-xl ${stat.bg} shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider truncate">{stat.title}</p>
              <h3 className="text-sm sm:text-xl font-black text-gray-950 tracking-tight truncate mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Bloque Medio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Top Productos */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
            <TrendingUp size={18} className="text-gray-950" />
            <h2 className="font-black text-xs sm:text-sm uppercase tracking-wider text-gray-900">Top Licores Más Vendidos</h2>
          </div>
          
          <div className="space-y-3.5">
            {loading ? (
              <div className="text-center text-gray-400 text-xs py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-amber-500" size={20} />
                <span>Calculando rotación de botellas...</span>
              </div>
            ) : topProductos.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-8 italic font-medium">Ningún licor ha registrado ventas aún.</div>
            ) : (
              topProductos.map((producto, index) => {
                const ventasActuales = Number(producto.ventas || producto.cantidad || 0);
                const porcentaje = (ventasActuales / maxVentas) * 100;
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800 truncate max-w-[75%]">
                        <span className="text-amber-500 font-black mr-1">#{index + 1}</span> {producto.nombre}
                      </span>
                      <span className="font-black text-gray-950 shrink-0 bg-gray-100 px-2 py-0.5 rounded-md text-[10px] border border-gray-200/40">
                        {ventasActuales} uds
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-gray-950 to-amber-500 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${porcentaje}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
            <Award className="text-amber-500" size={18} />
            <h2 className="font-black text-xs sm:text-sm uppercase tracking-wider text-gray-900">Top Clientes Frecuentes</h2>
          </div>
          
          <div className="space-y-2.5">
            {loading ? (
              <div className="text-center text-gray-400 text-xs py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-amber-500" size={20} />
                <span>Analizando niveles de lealtad...</span>
              </div>
            ) : topClientes.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-8 italic font-medium">No hay registros de compras de clientes.</div>
            ) : (
              topClientes.map((cliente, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50/70 border border-gray-100 p-3 rounded-xl text-xs hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-800 truncate">
                    <span className="text-gray-400 font-black mr-1">#{index + 1}</span> {cliente.nombre}
                  </span>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] border border-emerald-100/30">
                    ${Number(cliente.total_comprado || cliente.total || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Alertas de Stock */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="text-red-500 shrink-0" size={18} />
          <h2 className="font-black text-xs sm:text-sm uppercase tracking-wider text-gray-900">Alertas de Stock Crítico</h2>
        </div>
        
        <div className="p-4 space-y-2">
          {loading ? (
            <div className="text-center text-gray-400 text-xs py-6 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-red-500" size={18} />
              <span>Escaneando niveles de vitrina...</span>
            </div>
          ) : listaAlertas.length === 0 ? (
            <div className="text-center text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 rounded-xl font-bold text-xs py-5">
              ¡Todo el inventario está melo! ✨ Ningún producto en desabastecimiento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {listaAlertas.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-center bg-red-50/40 p-3 rounded-xl border border-red-100/40 text-xs hover:bg-red-50/70 transition-colors">
                  <span className="font-bold text-gray-800 truncate pr-2">{item.nombre}</span>
                  <span className="font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded-lg text-[10px] shrink-0">
                    {item.stock} unds restantes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
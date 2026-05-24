import { useState, useEffect } from 'react';
import { DollarSign, Package, Users, AlertTriangle, TrendingUp, Award } from 'lucide-react';

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
      const response = await fetch('https://nuevo-98vm.onrender.com/api/dashboard');
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
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const listaAlertas = statsData.alertasStock || [];

  {/* 🛠️ REPARADO: Se eliminaron por completo los licores y clientes falsos quemados */}
  const topProductos = (statsData.topProductos || []).slice(0, 10);
  const topClientes = (statsData.topClientes || []).slice(0, 10);

  const maxVentas = topProductos.length > 0 ? Math.max(...topProductos.map(p => Number(p.ventas || p.cantidad || 0))) : 100;

  const stats = [
    { title: 'Ventas Totales', value: loading ? '...' : `$${Number(statsData.totalIngresos).toLocaleString('es-CO')}`, icon: <DollarSign size={16} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'Licores', value: loading ? '...' : Number(statsData.totalProductos).toString(), icon: <Package size={16} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Alertas Stock', value: loading ? '...' : listaAlertas.length.toString(), icon: <AlertTriangle size={16} className={listaAlertas.length > 0 ? "text-red-500" : "text-gray-400"} />, bg: listaAlertas.length > 0 ? 'bg-red-50' : 'bg-gray-50' },
    { title: 'Clientes', value: loading ? '...' : Number(statsData.totalClientes).toString(), icon: <Users size={16} className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-4 p-1 sm:p-0">
      
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">La Bahía Principal</h1>
        <p className="text-gray-400 text-xs">Control de Licores Nicole.</p>
      </div>

      {/* METRICAS 2 COLUMNAS FIJAS EN CELULAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-2">
            <div className={`p-2 rounded-xl ${stat.bg} shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase truncate">{stat.title}</p>
              <h3 className="text-xs sm:text-lg font-black text-gray-900 truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* DETALLE DE RENDIMIENTO EN TIEMPO REAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* TOP PRODUCTOS REALES */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <TrendingUp size={16} />
            <h2 className="font-black text-xs uppercase tracking-wider text-gray-700">Top Licores Más Vendidos</h2>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-gray-400 text-xs py-4">Cargando top...</div>
            ) : topProductos.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-6 italic">Ningún licor ha registrado ventas aún.</div>
            ) : (
              topProductos.map((producto, index) => {
                const ventasActuales = Number(producto.ventas || producto.cantidad || 0);
                const porcentaje = (ventasActuales / maxVentas) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700 truncate max-w-[70%]">#{index + 1} {producto.nombre}</span>
                      <span className="font-black text-black shrink-0 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{ventasActuales} u</span>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-black h-full rounded-full" style={{ width: `${porcentaje}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* TOP CLIENTES REALES */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Award className="text-amber-500" size={16} />
            <h2 className="font-black text-xs uppercase tracking-wider text-gray-700">Top Clientes Premium</h2>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center text-gray-400 text-xs py-4">Cargando top...</div>
            ) : topClientes.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-6 italic">No hay historial de compras de clientes.</div>
            ) : (
              topClientes.map((cliente, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl text-xs">
                  <span className="font-bold text-gray-700 truncate">#{index + 1} {cliente.nombre}</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    ${Number(cliente.total_comprado || cliente.total || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* SECCIÓN DE ALERTAS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={16} />
          <h2 className="font-black text-xs uppercase tracking-wider text-gray-700">Alertas de Stock Crítico</h2>
        </div>
        <div className="p-3 space-y-2">
          {loading ? (
            <div className="text-center text-gray-400 text-xs py-4">Analizando stock...</div>
          ) : listaAlertas.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-4">¡Todo el inventario está melo! ✨</div>
          ) : (
            listaAlertas.map((item, index) => (
              <div key={item.id || index} className="flex justify-between items-center bg-red-50/60 p-3 rounded-xl border border-red-100/40 text-xs">
                <span className="font-bold text-gray-800 truncate pr-2">{item.nombre}</span>
                <span className="font-black text-red-600 bg-red-100/80 px-2.5 py-0.5 rounded-lg text-[10px] shrink-0">
                  {item.stock} unds
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
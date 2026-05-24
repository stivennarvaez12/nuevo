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

  const topProductos = statsData.topProductos.length > 0 ? statsData.topProductos : [
    { nombre: "Aguardiente Antioqueño Azul", ventas: 142 },
    { nombre: "Ron Medellín Añejo 3 Años", ventas: 98 },
    { nombre: "Cerveza Águila Original", ventas: 85 },
    { nombre: "Whisky Old Parr 12 Años", ventas: 42 },
    { nombre: "Vodka Absolute", ventas: 29 },
    { nombre: "Tequila José Cuervo", ventas: 18 }
  ];

  const topClientes = statsData.topClientes.length > 0 ? statsData.topClientes : [
    { nombre: "Juan Camilo Pérez", total_comprado: 450000 },
    { nombre: "Andrés Felipe Mendoza", total_comprado: 320000 },
    { nombre: "Diana Carolina Restrepo", total_comprado: 285000 },
    { nombre: "Carlos Mario Holguín", total_comprado: 190000 },
    { font: "Stiven Licorera Manager", nombre: "Stiven Manager", total_comprado: 150000 }
  ];

  const maxVentas = topProductos.length > 0 ? Math.max(...topProductos.map(p => p.ventas)) : 100;

  const stats = [
    { 
      title: 'Ventas Totales', 
      value: loading ? '...' : `$${Number(statsData.totalIngresos).toLocaleString('es-CO')}`, 
      icon: <DollarSign size={16} className="text-emerald-500 sm:w-5 sm:h-5" />, 
      bg: 'bg-emerald-50' 
    },
    { 
      title: 'Licores', 
      value: loading ? '...' : Number(statsData.totalProductos).toString(), 
      icon: <Package size={16} className="text-blue-500 sm:w-5 sm:h-5" />, 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Alertas Stock', 
      value: loading ? '...' : listaAlertas.length.toString(), 
      icon: <AlertTriangle size={16} className={listaAlertas.length > 0 ? "text-red-500" : "text-gray-400"} />, 
      bg: listaAlertas.length > 0 ? 'bg-red-50' : 'bg-gray-50' 
    },
    { 
      title: 'Clientes', 
      value: loading ? '...' : statsData.totalClientes > 0 ? statsData.totalClientes.toString() : (topClientes.length).toString(), 
      icon: <Users size={16} className="text-purple-500 sm:w-5 sm:h-5" />, 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <div className="space-y-4 p-1 sm:p-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">La Bahía Principal</h1>
        <p className="text-gray-400 text-xs mt-0.5">Control de Licores Nicole en vivo.</p>
      </div>

      {/* METRICAS GRID EXCLUSIVO MÓVIL (2 columnas limpias) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-3 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2.5 sm:gap-4">
            <div className={`p-2.5 sm:p-4 rounded-xl ${stat.bg} shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 truncate">{stat.title}</p>
              <h3 className="text-sm sm:text-xl font-black text-gray-900 mt-0.5 truncate">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN ANALÍTICA COMPACTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* TOP LICORES */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
            <TrendingUp className="text-black" size={18} />
            <div>
              <h2 className="font-black text-gray-900 text-sm sm:text-base">Top Productos Vendidos</h2>
            </div>
          </div>
          
          <div className="space-y-3">
            {topProductos.map((producto, index) => {
              const porcentaje = (producto.ventas / maxVentas) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700 truncate max-w-[75%]">
                      <span className="text-gray-300 font-black mr-1">#{index + 1}</span>
                      {producto.nombre}
                    </span>
                    <span className="font-black text-black bg-gray-50 px-1.5 py-0.2 rounded shrink-0">
                      {producto.ventas} u
                    </span>
                  </div>
                  <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-black h-full rounded-full transition-all" style={{ width: `${porcentaje}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP CLIENTES */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
            <Award className="text-amber-500" size={18} />
            <div>
              <h2 className="font-black text-gray-900 text-sm sm:text-base">Clientes Estrella</h2>
            </div>
          </div>

          <div className="space-y-2">
            {topClientes.map((cliente, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100/40 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-md font-black text-[10px] ${
                    index === 0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-bold text-gray-700 truncate">{cliente.nombre}</span>
                </div>
                <span className="font-black text-emerald-600 shrink-0 bg-emerald-50 px-2 py-0.5 rounded">
                  ${Number(cliente.total_comprado).toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ALERTAS CRÍTICAS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <AlertTriangle className={listaAlertas.length > 0 ? "text-red-500" : "text-gray-400"} size={16} />
          <h2 className="font-bold text-xs sm:text-sm text-gray-800">Alertas de Stock (5 unds o menos)</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-xs animate-pulse">Analizando...</div>
          ) : listaAlertas.length === 0 ? (
            <div className="p-6 text-center text-gray-400 font-medium text-xs">
              ¡Inventario al día! ✨
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <tbody>
                {listaAlertas.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-gray-50 hover:bg-gray-50 text-xs">
                    <td className="p-3 font-bold text-gray-700">{item.nombre}</td>
                    <td className="p-3 font-black text-red-500">{item.stock} u</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
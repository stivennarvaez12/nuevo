import { useState, useEffect } from 'react';
import { DollarSign, Package, Users, AlertTriangle } from 'lucide-react';

export default function DashboardHome() {
  const [statsData, setStatsData] = useState({
    totalIngresos: 0,
    totalProductos: 0,
    alertasStock: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // URL unificada para conectar directamente con producción en Render
      const response = await fetch('https://nuevo-98vm.onrender.com/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        
        // CORREGIDO: Blindaje contra datos nulos o respuestas inesperadas del backend
        setStatsData({
          totalIngresos: data?.totalIngresos ?? 0,
          totalProductos: data?.totalProductos ?? 0,
          alertasStock: Array.isArray(data?.alertasStock) ? data.alertasStock : []
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

  // Variables de lectura seguras basadas en el estado protegido
  const listaAlertas = statsData.alertasStock || [];

  const stats = [
    { 
      title: 'Ventas Totales', 
      value: loading ? '...' : `$${Number(statsData.totalIngresos).toLocaleString('es-CO')}`, 
      icon: <DollarSign className="text-emerald-500" />, 
      bg: 'bg-emerald-50' 
    },
    { 
      title: 'Licores Registrados', 
      value: loading ? '...' : Number(statsData.totalProductos).toString(), 
      icon: <Package className="text-blue-500" />, 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Alertas de Stock', 
      value: loading ? '...' : listaAlertas.length.toString(), 
      icon: <AlertTriangle className={listaAlertas.length > 0 ? "text-red-500" : "text-gray-400"} />, 
      bg: listaAlertas.length > 0 ? 'bg-red-50' : 'bg-gray-50' 
    },
    { 
      title: 'Clientes (Próximamente)', 
      value: '-', 
      icon: <Users className="text-purple-500" />, 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <div className="space-y-6 p-2 sm:p-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ENCABEZADO RESPONSIVO */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Resumen General</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenido al panel administrativo de tu licorería.</p>
      </div>

      {/* TARJETAS DE MÉTRICAS INTELIGENTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3.5 sm:p-4 rounded-xl ${stat.bg} shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ZONA DE ALERTAS AJUSTADA PARA PANTALLAS PEQUEÑAS */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <AlertTriangle className={listaAlertas.length > 0 ? "text-red-500" : "text-gray-400"} size={20} />
          <h2 className="font-bold text-sm sm:text-base md:text-lg text-gray-800">Bebidas a punto de agotarse (Stock crítico: 5 o menos)</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Cargando inventario...</div>
          ) : listaAlertas.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium text-sm">
              ¡Todo excelente! No tienes productos con bajo stock por ahora. ✨
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[500px] md:min-w-full">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">Producto</th>
                  <th className="p-4 font-bold">Stock Actual</th>
                  <th className="p-4 font-bold">Acción Recomendada</th>
                </tr>
              </thead>
              <tbody>
                {listaAlertas.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 font-bold text-gray-800">{item.nombre}</td>
                    <td className="p-4 font-black text-red-500">{item.stock} unidades</td>
                    <td className="p-4">
                      <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block">
                        Reordenar Mercancía
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FOOTER DE ESTADO */}
      <div className="mt-6 p-4 bg-gray-100 rounded-xl border border-dashed border-gray-300 text-center">
        <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-widest">
          Estado del Sistema: <span className="text-green-500 font-black">Dashboard en tiempo real con Aiven MySQL</span>
        </p>
      </div>

    </div>
  );
}
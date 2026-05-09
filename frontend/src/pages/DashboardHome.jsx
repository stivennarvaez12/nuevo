import { useState, useEffect } from 'react';
import { DollarSign, Package, Users, AlertTriangle } from 'lucide-react';

export default function DashboardHome() {
  // Estado para guardar TODA la data que viene del backend
  const [statsData, setStatsData] = useState({
    totalIngresos: 0,
    totalProductos: 0,
    alertasStock: []
  });
  const [loading, setLoading] = useState(true);

  // Función para pedir los datos a nuestra nueva ruta del backend
  const fetchStats = async () => {
    try {
      const response = await fetch('http://192.168.18.28:4000/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
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

  // Preparamos las tarjetas mezclando tu diseño con los datos reales
  const stats = [
    { 
      title: 'Ventas Totales', 
      value: loading ? '...' : `$${Number(statsData.totalIngresos).toLocaleString('es-CO')}`, 
      icon: <DollarSign className="text-emerald-500" />, 
      bg: 'bg-emerald-50' 
    },
    { 
      title: 'Licores Registrados', 
      value: loading ? '...' : statsData.totalProductos.toString(), 
      icon: <Package className="text-blue-500" />, 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Alertas de Stock', 
      value: loading ? '...' : statsData.alertasStock.length.toString(), 
      // El icono y el fondo cambian a rojo si hay alertas
      icon: <AlertTriangle className={statsData.alertasStock.length > 0 ? "text-red-500" : "text-gray-400"} />, 
      bg: statsData.alertasStock.length > 0 ? 'bg-red-50' : 'bg-gray-50' 
    },
    { 
      title: 'Clientes (Próximamente)', 
      value: '-', 
      icon: <Users className="text-purple-500" />, 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ENCABEZADO */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Resumen General</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel administrativo de tu licorería.</p>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ZONA DE ALERTAS (TABLA DE BAJO STOCK) */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <AlertTriangle className={statsData.alertasStock.length > 0 ? "text-red-500" : "text-gray-400"} size={20} />
          <h2 className="font-bold text-lg text-gray-800">Bebidas a punto de agotarse (Stock crítico: 5 o menos)</h2>
        </div>
        
        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Cargando inventario...</div>
          ) : statsData.alertasStock.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">
              ¡Todo excelente! No tienes productos con bajo stock por ahora.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-sm text-gray-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">Producto</th>
                  <th className="p-4 font-bold">Stock Actual</th>
                  <th className="p-4 font-bold">Acción Recomendada</th>
                </tr>
              </thead>
              <tbody>
                {statsData.alertasStock.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{item.nombre}</td>
                    <td className="p-4 font-black text-red-500">{item.stock} unidades</td>
                    <td className="p-4">
                      <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-block">
                        Contactar Proveedor
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
      <div className="mt-8 p-4 bg-gray-100 rounded-xl border border-dashed border-gray-300 text-center">
        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
          Estado de Conexión: <span className="text-green-500 underline">Dashboard sincronizado con DB</span>
        </p>
      </div>

    </div>
  );
}
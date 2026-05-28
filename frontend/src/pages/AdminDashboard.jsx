import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wine, Plus, Edit2, Trash2, Package, 
  AlertTriangle, TrendingUp, LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Importamos toast

// --- CONFIGURACIÓN DE LA URL ---
const RAW_URL = import.meta.env.VITE_API_URL || 'https://nuevo-98vm.onrender.com';
const API_URL = RAW_URL.replace(/\/$/, "");

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Cargar productos desde el Backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/productos`); 
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      toast.error("Error al sincronizar la bodega");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Función para ELIMINAR
  const handleDelete = async (id, nombre) => {
    // Mantenemos el confirm nativo por seguridad antes de borrar
    if (window.confirm(`¿Seguro que quieres eliminar "${nombre}" del inventario?`)) {
      const toastId = toast.loading(`Eliminando ${nombre}...`);
      try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
          toast.success("Producto eliminado correctamente", { id: toastId });
        } else {
          toast.error("El servidor rechazó la eliminación", { id: toastId });
        }
      } catch (error) {
        toast.error("No se pudo conectar con el servidor", { id: toastId });
      }
    }
  };

  // 3. Función para CERRAR SESIÓN
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNombre');
    toast.success("Sesión cerrada", { duration: 2000 });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans pb-20 lg:pb-0 animate-in fade-in duration-500">
      
      {/* --- SIDEBAR TRADICIONAL (SÓLO PC) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl shadow-md">
            <div className="flex items-center gap-0.5">
              <Wine className="text-amber-500 w-5 h-5 -rotate-12 translate-x-1" />
              <Wine className="text-amber-500 w-5 h-5 rotate-12 -translate-x-1" />
            </div>
          </div>
          <span className="font-black text-xl tracking-tighter text-gray-950">
            Licores <span className="text-amber-600">Nicole</span>
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-950 text-amber-500 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition-all hover:bg-black">
            <Package size={18} /> Inventario
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- NAV INFERIOR RESPONSIVO (SÓLO MÓVILES / ESTILO APP) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 px-8 flex items-center justify-between z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button className="flex flex-col items-center justify-center text-amber-600 font-black text-[10px] gap-1 tracking-widest">
          <Package size={22} />
          <span>BODEGA</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center text-gray-400 hover:text-red-500 font-bold text-[10px] gap-1 tracking-widest transition-colors">
          <LogOut size={22} />
          <span>SALIR</span>
        </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        
        {/* Encabezado Responsivo */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">Gestión de Bodega</h1>
            <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider hidden sm:block mt-0.5">Control de inventario en tiempo real</p>
          </div>
          <button className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs sm:text-sm uppercase tracking-wider px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 transition-all">
            <Plus size={16} /> <span className="hidden sm:inline">Agregar Licor</span><span className="sm:hidden">Agregar</span>
          </button>
        </header>

        {/* Métrica / Grid de Estadísticas Adaptables */}
        <section className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 shrink-0">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
            <div className="bg-gray-950 p-3.5 rounded-xl text-amber-500 shrink-0"><Package size={22}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Catálogo</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">{products.length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
            <div className={`p-3.5 rounded-xl shrink-0 ${products.filter(p => p.stock < 10).length > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle size={22}/>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Stock Crítico</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">{products.filter(p => p.stock < 10).length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
            <div className={`p-3.5 rounded-xl shrink-0 ${loading ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {loading ? <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/> : <TrendingUp size={22}/>}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Estado Servidor</p>
              <h3 className={`text-base sm:text-lg font-black tracking-tight truncate ${loading ? 'text-amber-600' : 'text-emerald-600'}`}>
                {loading ? 'Sincronizando...' : 'En Línea'}
              </h3>
            </div>
          </div>

        </section>

        {/* TABLA VS CARDS RESPONSIVAS */}
        <section className="px-4 sm:px-6 lg:px-8 pb-8 flex-1 min-w-0">
          <div className="bg-white lg:rounded-2xl shadow-sm lg:border border-gray-100 overflow-hidden rounded-xl">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400 font-medium text-xs sm:text-sm">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold tracking-wide">Descargando inventario...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs sm:text-sm font-bold tracking-wide">
                No hay licores registrados en la base de datos.
              </div>
            ) : (
              <>
                {/* 💻 VISTA PARA TABLERO / PC (Tabla clásica visible desde pantallas lg) */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Venta</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Actual</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-gray-900 text-sm">{product.nombre}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                              {product.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-emerald-600 text-sm">
                            ${Number(product.precio).toLocaleString('es-CO')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${product.stock < 10 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-emerald-500'}`}></span>
                              <span className="font-black text-sm text-gray-800">{product.stock} <span className="text-xs text-gray-400 font-bold">uds</span></span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-lg transition-all shadow-sm">
                                <Edit2 size={16}/>
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id, product.nombre)}
                                className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all shadow-sm"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 📱 VISTA PARA SMARTPHONES (Grid de Tarjetas Compactas) */}
                <div className="block lg:hidden p-4 space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-950 text-sm leading-tight">{product.nombre}</h4>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 rounded-md text-[9px] font-black uppercase tracking-wider">
                            {product.categoria}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-emerald-600 text-sm">${Number(product.precio).toLocaleString('es-CO')}</p>
                          <div className="flex items-center gap-1.5 justify-end mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${product.stock < 10 ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-emerald-500'}`}></span>
                            <span className="text-[11px] font-black text-gray-600">{product.stock} uds</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 border-t border-gray-50 pt-3 mt-1 justify-end">
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-lg text-xs font-bold shadow-sm active:bg-gray-50 transition-colors">
                          <Edit2 size={14}/> Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.nombre)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg text-xs font-bold shadow-sm active:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14}/> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
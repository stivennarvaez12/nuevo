import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wine, Plus, Edit2, Trash2, Package, 
  AlertTriangle, TrendingUp, LogOut, Shield, Users
} from 'lucide-react';

// --- CONFIGURACIÓN DE LA URL (Corregida) ---
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
      console.log(`📡 Conectando a: ${API_URL}/productos`);
      
      const response = await fetch(`${API_URL}/productos`); 
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Función para ELIMINAR
  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) {
      try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
          alert("Producto eliminado correctamente");
        } else {
          alert("El servidor rechazó la eliminación");
        }
      } catch (error) {
        alert("No se pudo conectar con el servidor para eliminar");
      }
    }
  };

  // 3. Función para CERRAR SESIÓN
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNombre');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans pb-20 lg:pb-0">
      
      {/* --- SIDEBAR TRADICIONAL (SÓLO PC) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="bg-amber-500 p-1.5 rounded-lg shadow-md shadow-amber-500/20">
            <div className="flex items-center gap-0.5">
              <Wine className="text-white w-5 h-5 -rotate-12 translate-x-1" />
              <Wine className="text-white w-5 h-5 rotate-12 -translate-x-1" />
            </div>
          </div>
          <span className="font-black text-xl tracking-tighter text-gray-900">
            Nicole <span className="text-amber-600">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl font-black text-sm uppercase tracking-wider">
            <Package size={18} /> Inventario
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-black text-sm uppercase tracking-wider transition-all"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- NAV INFERIOR RESPONSIVO (SÓLO MÓVILES / ESTILO APP) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 px-6 flex items-center justify-between z-50 shadow-xl">
        <button className="flex flex-col items-center justify-center text-amber-600 font-black text-[10px] gap-0.5">
          <Package size={20} />
          <span>BODEGA</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center text-gray-400 hover:text-red-500 font-bold text-[10px] gap-0.5">
          <LogOut size={20} />
          <span>SALIR</span>
        </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        
        {/* Encabezado Responsivo */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-gray-950 tracking-tight">Panel de Control</h1>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium hidden sm:block">Gestión de stock en tiempo real</p>
          </div>
          <button className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs sm:text-sm uppercase tracking-wider px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all">
            <Plus size={16} /> Agregar Licor
          </button>
        </header>

        {/* Métrica / Grid de Estadísticas Adaptables */}
        <section className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 shrink-0">
          
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0"><Package size={22}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Licores</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">{products.length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-xl text-red-500 shrink-0"><AlertTriangle size={22}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Stock Bajo</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">{products.filter(p => p.stock < 10).length}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600 shrink-0"><TrendingUp size={22}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Servidor</p>
              <h3 className={`text-base sm:text-lg font-black ${loading ? 'text-amber-500' : 'text-green-600'} truncate`}>
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
                <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Conectando con la bodega en Aiven...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs sm:text-sm font-medium">
                No hay productos registrados en la base de datos.
              </div>
            ) : (
              <>
                {/* 💻 VISTA PARA TABLERO / PC (Tabla clásica visible desde pantallas lg) */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900 text-sm">{product.nombre}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-wider">
                              {product.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-gray-950 text-sm">
                            ${Number(product.precio).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${product.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                              <span className="font-bold text-sm text-gray-800">{product.stock} und.</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-1.5">
                              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 size={16}/>
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id, product.nombre)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                    <div key={product.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-950 text-sm truncate">{product.nombre}</h4>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-gray-200 text-gray-400 rounded-md text-[9px] font-black uppercase tracking-wider">
                            {product.categoria}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-gray-950 text-sm">${Number(product.precio).toLocaleString()}</p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            <span className="text-[11px] font-bold text-gray-500">{product.stock} und.</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 border-t border-gray-100 pt-3 mt-1 justify-end">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm active:bg-gray-50">
                          <Edit2 size={12}/> Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.nombre)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold shadow-sm active:bg-red-100"
                        >
                          <Trash2 size={12}/> Eliminar
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
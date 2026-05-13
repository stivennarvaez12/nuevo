import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wine, Plus, Search, Edit2, Trash2, Package, 
  AlertTriangle, TrendingUp, LogOut 
} from 'lucide-react';

// --- CONFIGURACIÓN DE LA URL ---
// Si existe la variable en Vercel, la usa. Si no, usa tu IP local para cuando programes en casa.
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.18.28:4000';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Cargar productos desde el Backend
  const fetchProducts = async () => {
    try {
      // Usamos la constante dinámica API_URL
      const response = await fetch(`${API_URL}/productos`); 
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error de conexión:", error);
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
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
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
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold">
            <Package size={20} /> Inventario
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-black text-gray-800">Panel de Control</h1>
          <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg active:scale-95">
            <Plus size={20} /> Agregar Licor
          </button>
        </header>

        {/* Estadísticas */}
        <section className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Package size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Productos</p>
              <h3 className="text-2xl font-black">{products.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl text-red-600"><AlertTriangle size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Stock Bajo</p>
              <h3 className="text-2xl font-black">{products.filter(p => p.stock < 10).length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600"><TrendingUp size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Estado</p>
              <h3 className="text-2xl font-black text-green-600">Online</h3>
            </div>
          </div>
        </section>

        {/* TABLA --- */}
        <section className="px-8 pb-8 flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 italic text-gray-400">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                Cargando datos reales...
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Nombre</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Categoría</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Precio</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Stock</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{product.nombre}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">
                          {product.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ${Number(product.precio).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          <span className="font-bold">{product.stock} und.</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                            <Edit2 size={18}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.nombre)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
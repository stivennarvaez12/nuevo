import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Wine, Users, ShieldCheck, 
  UserCircle, ShoppingCart, TrendingDown, LayoutDashboard, LogOut,
  Package, Menu, X, Archive
} from 'lucide-react';
// 🔥 REGLA DE ORO: Importamos el contexto para saber el estado de la caja en tiempo real
import { useCaja } from '../contexto/CajaContext';

// 📦 IMPORTACIÓN EN PARALELO: Traemos todas las páginas aquí para mantenerlas vivas
import DashboardHome from '../pages/DashboardHome';
import Licores from '../pages/Licores'; 
import Ventas from '../pages/Ventas';
import Compras from '../pages/Compras'; 
import Gastos from '../pages/Gastos';
import Caja from '../pages/Caja';
import Clientes from '../pages/Clientes'; 
import Usuarios from '../pages/Usuarios';
import Roles from '../pages/Roles';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Extraemos el estado de la caja ('abierto' o 'cerrado')
  const { cajaEstado } = useCaja(); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNombre');
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20}/>, label: 'Inicio' },
    { path: '/dashboard/licores', icon: <Wine size={20}/>, label: 'Bebidas' },
    { path: '/dashboard/ventas', icon: <ShoppingCart size={20}/>, label: 'Ventas' },
    { path: '/dashboard/compras', icon: <Package size={20}/>, label: 'Compras' },
    { path: '/dashboard/gastos', icon: <TrendingDown size={20}/>, label: 'Gastos' },
    // 📦 CONTROL DE CAJA CENTRALIZADO
    { path: '/dashboard/caja', icon: <Archive size={20}/>, label: 'Control Caja' },
    { path: '/dashboard/clientes', icon: <Users size={20}/>, label: 'Clientes' },
    { path: '/dashboard/usuarios', icon: <UserCircle size={20}/>, label: 'Usuarios' },
    { path: '/dashboard/roles', icon: <ShieldCheck size={20}/>, label: 'Roles' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      
      {/* 1. BARRA SUPERIOR PARA CELULARES */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="bg-black p-1.5 rounded-lg">
            <Wine className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tight text-gray-900">Licores Nicole</span>
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* 2. MENÚ LATERAL (SIDEBAR) ADAPTABLE */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Cabecera del menú lateral con el estado de la caja */}
        <div className="p-5 flex flex-col border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-lg">
                <Wine className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-gray-900">Licores Nicole</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* 🔥 REGLA DE ORO: Indicador visual del estado de la caja */}
          <div className="flex items-center">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md w-full text-center ${
              cajaEstado === 'abierto' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {cajaEstado === 'abierto' ? '🟢 CAJA ABIERTA' : '🔴 CAJA CERRADA'}
            </span>
          </div>
        </div>
        
        {/* Cuerpo de navegación */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold ${
                      isActive 
                        ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Botón de Cerrar Sesión */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 3. CAPA OSCURA DE FONDO */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* 4. CONTENEDOR DE CONTENIDO PRINCIPAL PERSISTENTE */}
      {/* Reemplazamos <Outlet /> para renderizar condicionalmente usando clases CSS de visibilidad */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          
          <div className={currentPath === '/dashboard' || currentPath === '/dashboard/' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <DashboardHome />
          </div>

          <div className={currentPath === '/dashboard/licores' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Licores />
          </div>

          <div className={currentPath === '/dashboard/ventas' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Ventas />
          </div>

          <div className={currentPath === '/dashboard/compras' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Compras />
          </div>

          <div className={currentPath === '/dashboard/gastos' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Gastos />
          </div>

          <div className={currentPath === '/dashboard/caja' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Caja />
          </div>

          <div className={currentPath === '/dashboard/clientes' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Clientes />
          </div>

          <div className={currentPath === '/dashboard/usuarios' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Usuarios />
          </div>

          <div className={currentPath === '/dashboard/roles' ? 'block animate-in fade-in duration-150' : 'hidden'}>
            <Roles />
          </div>

        </div>
      </main>
    </div>
  );
}
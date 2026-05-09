import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Wine, Users, ShieldCheck, 
  UserCircle, ShoppingCart, TrendingDown, LayoutDashboard, LogOut,
  Receipt, Package, PackageCheck
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNombre');
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20}/>, label: 'Inicio' },
    { path: '/dashboard/licores', icon: <Wine size={20}/>, label: 'Bebidas' },
    { path: '/dashboard/ventas', icon: <ShoppingCart size={20}/>, label: 'Ventas' },
    { path: '/dashboard/historial', icon: <Receipt size={20}/>, label: 'Historial Ventas' },
    { path: '/dashboard/compras', icon: <Package size={20}/>, label: 'Compras' },
    // ¡NUEVO BOTÓN DE HISTORIAL DE COMPRAS!
    { path: '/dashboard/historial-compras', icon: <PackageCheck size={20}/>, label: 'Historial Compras' },
    { path: '/dashboard/gastos', icon: <TrendingDown size={20}/>, label: 'Gastos' },
    { path: '/dashboard/clientes', icon: <Users size={20}/>, label: 'Clientes' },
    { path: '/dashboard/usuarios', icon: <UserCircle size={20}/>, label: 'Usuarios' },
    { path: '/dashboard/roles', icon: <ShieldCheck size={20}/>, label: 'Roles' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-black p-2 rounded-lg">
            <Wine className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Licores Nicole</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      isActive 
                        ? 'bg-gray-100 text-black' 
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
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
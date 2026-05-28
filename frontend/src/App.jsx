import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 🔥 REGLA DE ORO: Importación de las notificaciones inyectada aquí

// 📦 REGLA DE ORO: Importamos el cerebro de la caja y su vista
import { CajaProvider } from './contexto/CajaContext';
import Caja from './pages/Caja';

import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import Licores from './pages/Licores'; 
import Ventas from './pages/Ventas';
import HistorialVentas from './pages/HistorialVentas';
import Compras from './pages/Compras'; 
import HistorialCompras from './pages/HistorialCompras';
import Gastos from './pages/Gastos';
import Clientes from './pages/Clientes'; 
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';

function App() {
  return (
    // Envolvemos toda la aplicación con el CajaProvider para que el estado llegue a cualquier pantalla
    <CajaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="licores" element={<Licores />} />
              <Route path="ventas" element={<Ventas />} />
              <Route path="historial" element={<HistorialVentas />} />
              <Route path="compras" element={<Compras />} />
              <Route path="historial-compras" element={<HistorialCompras />} /> 
              <Route path="gastos" element={<Gastos />} />
              
              {/* 📦 NUEVA RUTA: Registramos la página de control de caja */}
              <Route path="caja" element={<Caja />} />
              
              <Route path="clientes" element={<Clientes />} /> 
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="roles" element={<Roles />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* 🔥 REGLA DE ORO: El lienzo de notificaciones posicionado arriba a la derecha */}
        <Toaster 
          position="top-right" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              fontSize: '13px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#1f2937',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }
          }}
        />
      </BrowserRouter>
    </CajaProvider>
  );
}

export default App;
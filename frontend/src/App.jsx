import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
            <Route path="clientes" element={<Clientes />} /> 
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
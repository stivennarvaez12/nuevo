import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 🔥 REGLA DE ORO: Importación de las notificaciones inyectada aquí

// 📦 REGLA DE ORO: Importamos el cerebro de la caja y su vista
import { CajaProvider } from './contexto/CajaContext';

import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <CajaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<ProtectedRoute />}>
            {/* 🌟 LA CLAVE: El asterisco (/*) le permite a DashboardLayout controlar 
                y mantener vivos todos los módulos internos sin recargar */}
            <Route path="/dashboard/*" element={<DashboardLayout />} />
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
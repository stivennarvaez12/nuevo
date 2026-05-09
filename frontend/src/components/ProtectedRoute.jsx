import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Comprobamos si existe un token en el almacenamiento local
  const token = localStorage.getItem('token');

  // Si no hay token, lo devolvemos a la landing page inmediatamente
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si hay token, le permitimos ver el componente hijo (Outlet)
  return <Outlet />;
}
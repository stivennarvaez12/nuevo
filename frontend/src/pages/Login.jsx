import { Link, useNavigate } from 'react-router-dom';
import { Wine } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    // Ajustado padding en móviles (px-3 sm:px-4) para aprovechar espacio
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-4">
      {/* max-w-md asegura tamaño ideal en PC, w-full y rounded-2xl se ajustan perfecto en celular */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
        
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="bg-black p-3 rounded-full mb-3 sm:mb-4">
            <Wine className="text-white w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Bienvenido de nuevo</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 text-center">Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm"
              placeholder="admin@licoreria.com"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm active:scale-[0.98]"
          >
            Ingresar al Dashboard
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs sm:text-sm text-gray-500 hover:text-black hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wine, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // 🔥 REGLA DE ORO

export default function Login() {
  const navigate = useNavigate();
  
  // Estados para controlar los inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validación visual básica
    if (!email.trim() || !password.trim()) {
      return toast.error("Por favor, completa todos los campos");
    }

    const cargandoToast = toast.loading("Verificando credenciales...");
    setLoading(true);

    try {
      // Petición real al backend
      const response = await fetch('https://nuevo-98vm.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      toast.dismiss(cargandoToast);

      if (response.ok) {
        const data = await response.json();
        
        // Guardamos el ID del usuario en el navegador para usarlo en otras pantallas (ej. Gastos)
        if (data.id_usuario || data.id) {
          localStorage.setItem('id_usuario', data.id_usuario || data.id);
        }
        
        toast.success("¡Acceso concedido! Bienvenido 🍷");
        navigate('/dashboard');
      } else {
        // Error de credenciales (ej. 401 Unauthorized)
        toast.error("Correo o contraseña incorrectos");
      }
    } catch (error) {
      toast.dismiss(cargandoToast);
      console.error("Error en login:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 animate-in fade-in duration-500">
      
      {/* Contenedor principal que se estira perfectamente en celular sin cortar el botón inferior */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 flex flex-col my-auto">
        
        {/* Identidad de la Marca */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="bg-gray-950 p-3.5 rounded-2xl mb-3 shadow-md shadow-gray-100">
            <Wine className="text-white w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight text-center">Bienvenido de nuevo</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 text-center font-medium">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        {/* Formulario de Acceso */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          
          <div>
            <label className="block text-[10px] sm:text-xs font-black uppercase text-gray-400 mb-1.5 tracking-widest">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-950 outline-none transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
                placeholder="admin@licoreria.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-black uppercase text-gray-400 mb-1.5 tracking-widest">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-950 outline-none transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gray-950 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-100 active:scale-95 mt-2 flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Verificando...
              </>
            ) : (
              "Ingresar al Dashboard"
            )}
          </button>
        </form>

        {/* Retorno */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:text-gray-950 transition-colors uppercase tracking-wider text-[11px]">
            ← Volver al inicio
          </Link>
        </div>
        
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Wine, Sparkles } from 'lucide-react';
import LoginModal from '../components/LoginModal';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    // Estructura h-screen y overflow-hidden obligatoria para mantener la página estática (sin scroll)
    <div className="relative h-screen w-full font-sans overflow-hidden bg-white">
      
      {/* --- CAPA 1: LA IMAGEN DE FONDO (Toda la pantalla) --- */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/grupo-licores.jpg" 
          alt="Fondo de la Licorera" 
          className="w-full h-full object-cover object-center scale-100"
          // Imagen de respaldo por si acaso
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1574628283305-6535d21a2eb2?q=80&w=2000&auto=format&fit=crop";
          }}
        />
        
        {/* Filtro de luminosidad sutil para mantener el brillo pero dar contraste */}
        <div className="absolute inset-0 bg-black/10 backdrop-brightness-110"></div>
        
        {/* Degradado suave para asegurar el contraste de los textos ahora que no tienen cajas */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </div>

      {/* --- CAPA 2: CONTENIDO (Encima de la foto) --- */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Navbar Superior - Totalmente transparente y simplificado */}
        <header className="w-full px-6 py-4 lg:px-16 flex justify-center items-center">
          {/* Logo - Ahora flota directamente sobre el fondo */}
          <div className="flex items-center gap-3">
            
            {/* 👇 AQUÍ ESTÁ EL CAMBIO DE ICONO: Simulación de Brindis con dos copas */}
            <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-0.5">
              <Wine className="text-white w-5 h-5 -rotate-12 translate-x-1" />
              <Wine className="text-white w-5 h-5 rotate-12 -translate-x-1" />
            </div>

            {/* 👇 CAMBIO DE COLOR: Color blanco con drop-shadow para el nombre */}
            <span className="text-2xl lg:text-3xl font-black tracking-tighter text-white drop-shadow-md">
              Licores <span className="text-amber-400">Nicole</span>
            </span>
          </div>

          {/* El botón de "Acceso Admin" ha sido eliminado */}
        </header>

        {/* CONTENIDO CENTRAL - Ahora flota directamente sin la caja blanca */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          
          <div className="max-w-4xl p-8 lg:p-10 animate-in fade-in zoom-in duration-500">
            
            {/* Tag superior - Se mantiene su color llamativo pero flota libremente */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-black rounded-full mb-8 font-black text-[10px] lg:text-xs tracking-widest uppercase shadow-xl shadow-amber-500/20">
              <Sparkles size={14} />
              El Sabor de Colombia
            </div>

            {/* 👇 AQUÍ ESTÁ EL CAMBIO CRUCIAL:
                - h1 cambiada a text-white para contraste.
                - drop-shadow-lg añadida para legibilidad perfecta.
                - Degradado central ajustado a colores más claros/oro. */}
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-tight text-white mb-6 drop-shadow-lg">
              Tus Licores Favoritos, <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500 bg-clip-text text-transparent">
                A Un Clic De Distancia.
              </span>
            </h1>

            {/* 👇 CAMBIO DE COLOR: Cambiado a text-amber-50 (un blanco cremoso) */}
            <p className="text-amber-50 text-lg lg:text-2xl font-semibold max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow-md">
              Aguardiente Antioqueño, rones nacionales y marcas internacionales. 
              Calidad y servicio en <span className="text-amber-300 font-black">Licores Nicole.</span>
            </p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-12 py-4 bg-amber-500 text-black text-xl font-black rounded-2xl hover:bg-amber-400 transition-all hover:scale-105 shadow-2xl shadow-amber-500/40 active:scale-95"
            >
              INICIAR SESIÓN
            </button>
          </div>
        </main>

        {/* Footer - Discreto y transparente */}
        <footer className="w-full py-4 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full">
             {/* 👇 CAMBIO DE COLOR: Cambiado a text-amber-100 */}
             <span className="text-amber-100 font-bold tracking-widest text-[10px] uppercase drop-shadow-sm">
               ADMINISTRACIÓN PROFESIONAL Nicole © {new Date().getFullYear()}
             </span>
          </div>
        </footer>
      </div>

      {/* Modal de Login (mantenemos el efecto Glassmorphism para que el modal flote sobre la escena) */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
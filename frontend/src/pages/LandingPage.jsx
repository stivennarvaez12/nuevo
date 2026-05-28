import { useState } from 'react';
import { Wine, Sparkles } from 'lucide-react';
import LoginModal from '../components/LoginModal'; // 🔥 El modal vuelve a casa

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    // En PC se congela (lg:h-screen lg:overflow-hidden), pero en móvil permite scroll si el texto es muy grande
    <div className="relative min-h-screen lg:h-screen w-full font-sans overflow-y-auto lg:overflow-hidden bg-gray-950 flex flex-col justify-between">
      
      {/* --- CAPA 1: LA IMAGEN DE FONDO (Fija y cubriendo todo el viewport) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/grupo-licores.jpg" 
          alt="Fondo de la Licorera" 
          className="w-full h-full object-cover object-center scale-100"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1574628283305-6535d21a2eb2?q=80&w=2000&auto=format&fit=crop";
          }}
        />
        
        {/* Filtro de luminosidad sutil para mantener el brillo pero dar contraste */}
        <div className="absolute inset-0 bg-black/20 backdrop-brightness-110"></div>
        
        {/* Degradado responsivo: más oscuro abajo en móviles para proteger los textos */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70 lg:to-black/50"></div>
      </div>

      {/* --- CAPA 2: CONTENIDO ADAPTABLE --- */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen lg:h-full w-full py-4 sm:py-6">
        
        {/* Navbar Superior - Totalmente transparente */}
        <header className="w-full px-4 sm:px-6 lg:px-16 flex justify-center items-center shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Simulación de Brindis con dos copas */}
            <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-0.5 shrink-0">
              <Wine className="text-white w-4 h-4 sm:w-5 sm:h-5 -rotate-12 translate-x-0.5" />
              <Wine className="text-white w-4 h-4 sm:w-5 sm:h-5 rotate-12 -translate-x-0.5" />
            </div>

            <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-white drop-shadow-md select-none">
              Licores <span className="text-amber-400">Nicole</span>
            </span>
          </div>
        </header>

        {/* CONTENIDO CENTRAL - Centrado y protegido contra desbordamientos */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 lg:py-0">
          <div className="max-w-4xl p-2 sm:p-6 lg:p-10 animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            
            {/* Tag superior flotante */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-black rounded-full mb-5 sm:mb-6 lg:mb-8 font-black text-[9px] sm:text-[10px] lg:text-xs tracking-widest uppercase shadow-xl shadow-amber-500/20 select-none">
              <Sparkles size={12} className="shrink-0" />
              El Sabor de Colombia
            </div>

            {/* Título Principal Elástico */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-white mb-4 sm:mb-6 drop-shadow-lg">
              Tus Licores Favoritos, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500 bg-clip-text text-transparent">
                A Un Clic De Distancia.
              </span>
            </h1>

            {/* Párrafo descriptivo adaptado a lectura móvil */}
            <p className="text-amber-50/90 text-sm sm:text-base lg:text-xl font-medium max-w-xl lg:max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 drop-shadow-md">
              Aguardiente Antioqueño, rones nacionales y marcas internacionales. 
              Calidad y servicio en <span className="text-amber-300 font-black">Licores Nicole.</span>
            </p>
            
            {/* Botón de Acción Principal */}
            <button 
              onClick={() => setIsModalOpen(true)} // ✅ Activamos el modal otra vez
              className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 bg-amber-500 text-black text-base sm:text-lg lg:text-xl font-black rounded-xl sm:rounded-2xl hover:bg-amber-400 transition-all hover:scale-105 shadow-xl shadow-amber-500/30 active:scale-95 tracking-wide"
            >
              INICIAR SESIÓN
            </button>
          </div>
        </main>

        {/* Footer - Discreto, transparente y siempre al fondo */}
        <footer className="w-full text-center shrink-0 px-4 mt-auto">
          <div className="inline-block py-1">
             <span className="text-amber-200/60 font-bold tracking-widest text-[9px] sm:text-[10px] uppercase drop-shadow-sm">
               ADMINISTRACIÓN PROFESIONAL Nicole © {new Date().getFullYear()}
             </span>
          </div>
        </footer>
      </div>

      {/* Modal de Login (Glassmorphism) */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
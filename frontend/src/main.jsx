import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { toast } from 'react-hot-toast' // 🔥 REGLA DE ORO: Importación directa para el truco global

// 🛠️ TRUCO GLOBAL: Reemplazamos el 'alert' nativo de Chrome en TODO el sistema
window.alert = (mensaje) => {
  const msgLimpio = mensaje || "";
  const textoMin = msgLimpio.toLowerCase();

  // Detectamos si el mensaje es de éxito o de alerta/error
  const esExito = textoMin.includes('éxito') || 
                  textoMin.includes('perfecto') || 
                  textoMin.includes('excelente') || 
                  textoMin.includes('guardada') || 
                  textoMin.includes('actualizado') ||
                  textoMin.includes('bienvenido');

  if (esExito) {
    toast.success(msgLimpio, {
      icon: '🍾', // Icono personalizado para tu distribuidora
      duration: 3500,
      style: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        borderRadius: '12px',
      }
    });
  } else {
    toast.error(msgLimpio, {
      duration: 4000,
      style: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        borderRadius: '12px',
      }
    });
  }
};

// Renderizado normal de tu aplicación
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
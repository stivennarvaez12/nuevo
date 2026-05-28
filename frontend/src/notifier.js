import { toast } from 'react-hot-toast';

// 🚀 Este objeto manejará las burbujas flotantes de TODAS las pantallas
const notifier = {
  success: (msg) => {
    toast.success(msg, {
      icon: '🍾', // Icono ideal para tu distribuidora de licores
      duration: 3000,
    });
  },
  error: (msg) => {
    toast.error(msg, {
      duration: 4000,
    });
  },
  loading: (msg) => {
    return toast.loading(msg);
  },
  dismiss: (id) => {
    toast.dismiss(id);
  }
};

export default notifier;
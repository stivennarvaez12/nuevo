import { useState, useEffect } from 'react';
import { 
  Wine, Plus, Search, Edit2, Trash2, 
  RefreshCcw, X, ImagePlus, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // 🔥 Integración limpia de notificaciones

export default function Licores() {
  const [licores, setLicores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  // Mantenemos la propiedad interna como 'precio' para que coincida con tus inputs
  const [nuevoLicor, setNuevoLicor] = useState({
    nombre: '', categoria: '', precio: '', stock: ''
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const fetchLicores = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nuevo-98vm.onrender.com/api/productos');
      if (!response.ok) throw new Error('Error al conectar');
      const data = await response.json();
      setLicores(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al sincronizar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicores();
  }, []);

  const handleInputChange = (e) => {
    setNuevoLicor({ ...nuevoLicor, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file)); 
    }
  };

  const abrirModalEditar = (licor) => {
    setModoEdicion(true);
    setIdEditar(licor.id);
    setNuevoLicor({
      nombre: licor.nombre,
      categoria: licor.categoria,
      precio: licor.precio_venta || licor.precio || '', // 🔥 Asegura capturar el valor correcto de la DB
      stock: licor.stock
    });
    setImagenPreview(licor.imagen ? `https://nuevo-98vm.onrender.com/uploads/${licor.imagen}` : null);
    setImagenFile(null);
    setIsModalOpen(true);
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoLicor({ nombre: '', categoria: '', precio: '', stock: '' });
    setImagenPreview(null);
    setImagenFile(null);
    setIsModalOpen(true);
  };

  const guardarLicor = async (e) => {
    e.preventDefault();
    
    const cargandoToast = toast.loading(modoEdicion ? "Actualizando producto en MySQL..." : "Guardando nuevo licor...");
    const formData = new FormData();
    formData.append('nombre', nuevoLicor.nombre);
    formData.append('categoria', nuevoLicor.categoria);
    
    // 🔥 EL ARREGLO MAESTRO: Enviamos 'precio_venta' que es la columna que el Backend y MySQL esperan
    formData.append('precio_venta', nuevoLicor.precio); 
    formData.append('stock', nuevoLicor.stock);
    
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }

    const url = modoEdicion 
      ? `https://nuevo-98vm.onrender.com/api/productos/${idEditar}` 
      : 'https://nuevo-98vm.onrender.com/api/productos';
      
    const method = modoEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method: method, body: formData });
      toast.dismiss(cargandoToast);

      if (response.ok) {
        toast.success(modoEdicion ? "¡Licor actualizado con éxito! 🍾" : "¡Licor agregado con éxito! 🥃");
        setIsModalOpen(false); 
        fetchLicores(); 
      } else {
        toast.error("Error al guardar el licor en la base de datos");
      }
    } catch (error) {
      toast.dismiss(cargandoToast);
      toast.error("Error al conectar con el servidor");
    }
  };

  const eliminarLicor = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) {
      try {
        const res = await fetch(`https://nuevo-98vm.onrender.com/api/productos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setLicores(licores.filter(l => l.id !== id));
          toast.success("Producto eliminado del sistema");
        } else {
          toast.error("No se pudo eliminar el producto");
        }
      } catch (err) {
        toast.error("Error al conectar con el servidor");
      }
    }
  };

  const licoresFiltrados = licores.filter(licor =>
    (licor.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (licor.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECCIÓN DE ENCABEZADO ACCESIBLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">Gestión de Inventario</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Administra el stock, precios y fotos de tus productos en formato visual.</p>
        </div>
        <button 
          onClick={abrirModalNuevo}
          className="w-full sm:w-auto bg-gray-950 text-white px-5 py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Agregar Nuevo Licor
        </button>
      </div>

      {/* SECCIÓN DE BÚSQUEDA Y CONTROL */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-950 outline-none font-medium text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchLicores} 
          className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          title="Sincronizar inventario"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* CONTENEDOR DEL CATÁLOGO */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-gray-950" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Sincronizando con MySQL...</p>
          </div>
        ) : licoresFiltrados.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Wine size={40} className="opacity-20" />
            <p className="text-xs sm:text-sm font-medium text-center">No hay licores registrados en el inventario.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {licoresFiltrados.map((licor) => {
              // Manejo seguro del precio tanto si viene como 'precio' o 'precio_venta' de la DB
              const valPrecio = licor.precio_venta || licor.precio || 0;
              return (
                <div key={licor.id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                  
                  {/* Visualizador de imagen adaptable */}
                  <div className="w-full aspect-square overflow-hidden bg-gray-50/70 flex items-center justify-center p-4 relative">
                    {licor.imagen ? (
                      <img 
                        src={`https://nuevo-98vm.onrender.com/uploads/${licor.imagen}`} 
                        alt={licor.nombre} 
                        className="max-h-full max-w-full object-contain object-center transition-transform group-hover:scale-105"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Error+Imagen'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <Wine size={44} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Sin foto</span>
                      </div>
                    )}
                    
                    {/* Badge de Categoría flotante */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-950 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                      {licor.categoria || "Licor"}
                    </span>
                  </div>

                  {/* Detalles de la tarjeta */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 min-h-[2.5rem]">{licor.nombre}</h3>
                      <p className="font-black text-gray-950 text-xl sm:text-2xl">${Number(valPrecio).toLocaleString('es-CO')}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${licor.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        <span className={`font-bold text-xs ${licor.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                          {licor.stock} und. <span className="font-medium text-gray-400">disponibles</span>
                        </span>
                      </div>

                      {/* Botonera de acciones */}
                      <div className="border-t border-gray-50 pt-2.5 flex justify-end gap-1">
                        <button 
                          type="button"
                          onClick={() => abrirModalEditar(licor)} 
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Editar Producto"
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          type="button"
                          onClick={() => eliminarLicor(licor.id, licor.nombre)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Eliminar Producto"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL RESPONSIVO PARA REGISTRO/EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden flex flex-col max-h-[92vh] sm:max-h-none animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            
            {/* Cabecera del modal */}
            <div className="p-4 sm:p-5 bg-gray-950 text-white flex justify-between items-center shrink-0">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <Wine size={20} className="text-amber-400" /> {modoEdicion ? 'Editar Licor' : 'Nuevo Licor'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {/* Cuerpo del formulario deslizable */}
            <form onSubmit={guardarLicor} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-8 sm:pb-6">
              
              {/* Zona de carga de imagen */}
              <div className="flex flex-col items-center justify-center">
                <label className="relative cursor-pointer group flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-gray-950 transition-colors">
                    {imagenPreview ? (
                      <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus size={24} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                    )}
                  </div>
                  <span className="mt-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {modoEdicion ? 'Cambiar Foto' : 'Subir Foto'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* Campos de texto */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Nombre del Licor</label>
                <input required name="nombre" value={nuevoLicor.nombre} onChange={handleInputChange} type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-950 outline-none text-xs sm:text-sm font-medium transition-all" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Categoría</label>
                <input required name="categoria" value={nuevoLicor.categoria} onChange={handleInputChange} type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-950 outline-none text-xs sm:text-sm font-medium transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Precio ($)</label>
                  <input required name="precio" value={nuevoLicor.precio} onChange={handleInputChange} type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-950 outline-none text-xs sm:text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Stock</label>
                  <input required name="stock" value={nuevoLicor.stock} onChange={handleInputChange} type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-950 outline-none text-xs sm:text-sm font-medium transition-all" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-gray-950 text-white py-3.5 sm:py-4 rounded-xl font-black text-xs uppercase tracking-widest mt-2 hover:bg-gray-800 transition-all shadow-md active:scale-95">
                {modoEdicion ? 'Actualizar Producto' : 'Guardar Licor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
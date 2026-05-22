import { useState, useEffect } from 'react';
import { 
  Wine, Plus, Search, Edit2, Trash2, 
  RefreshCcw, X, ImagePlus 
} from 'lucide-react';

export default function Licores() {
  const [licores, setLicores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para saber si estamos editando
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  const [nuevoLicor, setNuevoLicor] = useState({
    nombre: '', categoria: '', precio: '', stock: ''
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const fetchLicores = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nuevo-98vm.onrender.com/productos');
      if (!response.ok) throw new Error('Error al conectar');
      const data = await response.json();
      setLicores(data);
    } catch (error) {
      console.error("Error:", error);
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

  // Función para abrir el modal listo para editar
  const abrirModalEditar = (licor) => {
    setModoEdicion(true);
    setIdEditar(licor.id);
    setNuevoLicor({
      nombre: licor.nombre,
      categoria: licor.categoria,
      precio: licor.precio,
      stock: licor.stock
    });
    setImagenPreview(licor.imagen ? `https://nuevo-98vm.onrender.com/uploads/${licor.imagen}` : null);
    setImagenFile(null);
    setIsModalOpen(true);
  };

  // Función para abrir el modal en modo "Agregar nuevo"
  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoLicor({ nombre: '', categoria: '', precio: '', stock: '' });
    setImagenPreview(null);
    setImagenFile(null);
    setIsModalOpen(true);
  };

  // Guarda Nuevo O Actualizar Existente
  const guardarLicor = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', nuevoLicor.nombre);
    formData.append('categoria', nuevoLicor.categoria);
    formData.append('precio', nuevoLicor.precio);
    formData.append('stock', nuevoLicor.stock);
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }

    const url = modoEdicion 
      ? `https://nuevo-98vm.onrender.com/productos/${idEditar}` 
      : 'https://nuevo-98vm.onrender.com/productos';
      
    const method = modoEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method: method, body: formData });

      if (response.ok) {
        alert(modoEdicion ? "¡Licor actualizado con éxito!" : "¡Licor agregado con éxito!");
        setIsModalOpen(false); 
        fetchLicores(); 
      } else {
        alert("Error al guardar el licor en la base de datos");
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  };

  const eliminarLicor = async (id, nombre) => {
    if (window.confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) {
      try {
        const res = await fetch(`https://nuevo-98vm.onrender.com/productos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setLicores(licores.filter(l => l.id !== id));
        }
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  const licoresFiltrados = licores.filter(licor =>
    licor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    licor.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Gestión de Inventario</h1>
          <p className="text-gray-500 mt-1">Administra el stock, precios y fotos de tus productos en un formato visual.</p>
        </div>
        <button 
          onClick={abrirModalNuevo}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2.5 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={22} /> Agregar Nuevo Licor
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-5 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none font-medium text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchLicores} className="p-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
          <RefreshCcw size={22} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4 text-gray-400">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold uppercase tracking-widest text-xs">Sincronizando con MySQL...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {licoresFiltrados.map((licor) => (
              <div key={licor.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="w-full aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-6">
                  {licor.imagen ? (
                    <img 
                      src={`https://nuevo-98vm.onrender.com/uploads/${licor.imagen}`} 
                      alt={licor.nombre} 
                      className="max-h-full max-w-full object-contain object-center transition-transform group-hover:scale-110"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Error+Imagen'; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Wine size={64} className="mb-3" />
                      <span className="text-sm font-medium">Sin foto</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 text-xl leading-tight flex-1">{licor.nombre}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[11px] font-black uppercase">
                      {licor.categoria}
                    </span>
                  </div>
                  <p className="font-black text-gray-950 text-3xl">${Number(licor.precio).toLocaleString('es-CO')}</p>
                  <div className="flex items-center gap-2.5 pt-1">
                    <span className={`w-3 h-3 rounded-full ${licor.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    <span className={`font-bold text-base ${licor.stock < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                      {licor.stock} und. <span className="font-medium text-gray-500">disponibles</span>
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-5 mt-auto flex justify-end gap-3">
                    <button 
                      onClick={() => abrirModalEditar(licor)} 
                      className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Editar Producto"
                    >
                      <Edit2 size={20}/>
                    </button>
                    <button 
                      onClick={() => eliminarLicor(licor.id, licor.nombre)} 
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar Producto"
                    >
                      <Trash2 size={20}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-black text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Wine size={24} className="text-amber-500" /> {modoEdicion ? 'Editar Licor' : 'Nuevo Licor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={guardarLicor} className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center">
                <label className="relative cursor-pointer group flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group-hover:border-black transition-colors">
                    {imagenPreview ? (
                      <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus size={30} className="text-gray-400 group-hover:text-black transition-colors" />
                    )}
                  </div>
                  <span className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {modoEdicion ? 'Cambiar Foto' : 'Subir Foto'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 tracking-widest">Nombre del Licor</label>
                <input required name="nombre" value={nuevoLicor.nombre} onChange={handleInputChange} type="text" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 tracking-widest">Categoría</label>
                <input required name="categoria" value={nuevoLicor.categoria} onChange={handleInputChange} type="text" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 tracking-widest">Precio ($)</label>
                  <input required name="precio" value={nuevoLicor.precio} onChange={handleInputChange} type="number" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-1.5 tracking-widest">Stock</label>
                  <input required name="stock" value={nuevoLicor.stock} onChange={handleInputChange} type="number" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                {modoEdicion ? 'Actualizar Producto' : 'Guardar Licor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
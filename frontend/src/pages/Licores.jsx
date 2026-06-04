import { useState, useEffect } from 'react';
import { 
  Wine, Plus, Search, Edit2, Trash2, 
  RefreshCcw, X, ImagePlus, Loader2,
  Download, Upload 
} from 'lucide-react';
import { toast } from 'react-hot-toast'; 
import * as XLSX from 'xlsx'; 

export default function Licores() {
  const [licores, setLicores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // ==========================================
  // 🔥 LÓGICA DE EXCEL (IMPORTAR Y EXPORTAR)
  // ==========================================
  
  const exportarAExcel = () => {
    if (licores.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    
    const dataMapeada = licores.map(l => ({
      "Nombre": l.nombre,
      "Categoría": l.categoria,
      "Precio Venta": l.precio || l.precio_venta || 0,
      "Stock": l.stock
    }));

    const ws = XLSX.utils.json_to_sheet(dataMapeada);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bebidas");
    XLSX.writeFile(wb, "Inventario_Bebidas.xlsx");
    toast.success("¡Catálogo exportado a Excel! 📊");
  };

  const importarDesdeExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const t0 = performance.now(); 
    const lecturaToast = toast.loading("Procesando archivo Excel...");
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const dataJson = XLSX.utils.sheet_to_json(ws);

        if (dataJson.length === 0) {
          toast.dismiss(lecturaToast);
          toast.error("El archivo de Excel está vacío");
          return;
        }

        const productosLote = dataJson.map(item => ({
          nombre: item.Nombre || item.nombre || "Sin nombre",
          categoria: item.Categoría || item.categoria || "Bebidas",
          precio: item.Precio || item.precio_venta || item.precio || 0, 
          stock: item.Stock || item.stock || 0,
          imagen: null,
          descripcion: null
        }));

        toast.dismiss(lecturaToast);
        const subiendoToast = toast.loading(`Insertando ${productosLote.length} registros en MySQL...`);

        const response = await fetch('https://nuevo-98vm.onrender.com/api/productos/importar-masivo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productosLote) 
        });

        const resultado = await response.json();
        toast.dismiss(subiendoToast);

        if (response.ok) {
          const t1 = performance.now();
          const latenciaTotal = ((t1 - t0) / 1000).toFixed(2);
          toast.success(`¡Se insertaron ${resultado.registrosInsertados || productosLote.length} registros con éxito! 🚀 (Tiempo Frontend: ${latenciaTotal}s)`);
          fetchLicores(); 
        } else {
          toast.error(resultado.error || "Error en el servidor al procesar el lote.");
        }
      } catch (err) {
        toast.dismiss(lecturaToast);
        console.error(err);
        toast.error("Error al leer la estructura del archivo Excel");
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; 
  };

  // ==========================================
  // CONTROL DE COMPONENTES INDIVIDUALES
  // ==========================================

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
    // Guardamos rigurosamente el ID primario original para no perder la referencia de la venta
    setIdEditar(licor.id || licor.id_producto); 
    
    let precioOriginal = licor.precio || licor.precio_venta || '';
    if (typeof precioOriginal === 'string') {
      precioOriginal = precioOriginal.replace(',', '.');
    }

    setNuevoLicor({
      nombre: licor.nombre || licor.nombre_producto || '',
      categoria: licor.categoria || '',
      precio: precioOriginal ? parseFloat(precioOriginal) : '', 
      stock: licor.stock ?? ''
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
    
    const cargandoToast = toast.loading(modoEdicion ? "Modificando stock/precio en MySQL sin alterar ventas..." : "Guardando nuevo licor...");
    const formData = new FormData();
    
    // Purificamos el valor numérico para que MySQL ejecute el UPDATE de forma segura
    let precioLimpio = nuevoLicor.precio;
    if (typeof precioLimpio === 'string') {
      precioLimpio = precioLimpio.replace(/[^0-9.]/g, '');
    }
    const precioNumerico = parseFloat(precioLimpio) || 0;

    // NOTA DE PROTECCIÓN DE LLAVE FORÁNEA: 
    // Solo enviamos los campos modificables. NUNCA incluimos variables de tipo "id" dentro del cuerpo (body/FormData),
    // de esta manera MySQL no intentará alterar la columna primaria vinculada al detalle de las ventas existentes.
    formData.append('nombre', nuevoLicor.nombre);
    formData.append('nombre_producto', nuevoLicor.nombre);
    formData.append('categoria', nuevoLicor.categoria);
    formData.append('precio', precioNumerico); 
    formData.append('precio_venta', precioNumerico); 
    formData.append('stock', parseInt(nuevoLicor.stock) || 0);
    
    if (imagenFile) {
      formData.append('imagen', imagenFile);
    }

    const url = modoEdicion 
      ? `https://nuevo-98vm.onrender.com/api/productos/${idEditar}` 
      : 'https://nuevo-98vm.onrender.com/api/productos';
      
    const method = modoEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method: method, body: formData });
      const resData = await response.json().catch(() => ({}));
      toast.dismiss(cargandoToast);

      if (response.ok) {
        toast.success(modoEdicion ? "¡Campos actualizados con éxito! 🍾" : "¡Licor agregado con éxito! 🥃");
        setIsModalOpen(false); 
        fetchLicores(); 
      } else {
        // Si el Backend sigue fallando por código interno, este mensaje nos dirá exactamente qué consulta falló en la consola
        console.error("Error de Restricción de Servidor:", resData);
        toast.error(resData.error || "La base de datos rechazó la modificación por integridad de ventas.");
      }
    } catch (error) {
      toast.dismiss(cargandoToast);
      toast.error("Error al conectar con el servidor");
    }
  };

  const eliminarLicor = async (id, nombre) => {
    const idReal = id || idEditar;
    if (!idReal) {
      toast.error("No se detectó un ID válido para eliminar");
      return;
    }

    if (window.confirm(`¿Seguro que quieres eliminar "${nombre}"? Nota: Si este producto tiene ventas registradas, el sistema bloqueará la eliminación automática por seguridad.`)) {
      try {
        const res = await fetch(`https://nuevo-98vm.onrender.com/api/productos/${idReal}`, { method: 'DELETE' });
        if (res.ok) {
          setLicores(licores.filter(l => (l.id !== idReal && l.id_producto !== idReal)));
          toast.success("Producto eliminado del sistema");
        } else {
          toast.error("MySQL denegó la eliminación: Este licor cuenta con historial de ventas.");
        }
      } catch (err) {
        toast.error("Error al conectar con el servidor");
      }
    }
  };

  const licoresFiltrados = licores.filter(licor =>
    (licor.nombre || licor.nombre_producto || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (licor.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECCIÓN DE ENCABEZADO ACTUALIZADA CON BOTONES DE EXCEL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">Gestión de Inventario</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Administra el stock, precios y fotos de tus productos en formato masivo o visual.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* 🟢 BOTÓN EXPORTAR EXCEL */}
          <button 
            type="button"
            onClick={exportarAExcel}
            className="w-full sm:w-auto bg-emerald-600 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-95"
          >
            <Download size={18} /> Exportar Excel
          </button>

          {/* 🔵 BOTÓN IMPORTAR LOTE */}
          <label className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95 cursor-pointer text-center justify-center">
            <Upload size={18} /> Importar Lote
            <input type="file" accept=".xlsx, .xls" onChange={importarDesdeExcel} className="hidden" />
          </label>

          {/* ⚫ BOTÓN INDIVIDUAL ORIGINAL */}
          <button 
            type="button" 
            onClick={abrirModalNuevo}
            className="w-full sm:w-auto bg-gray-950 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> Agregar Nuevo Licor
          </button>
        </div>
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
              const idReal = licor.id || licor.id_producto;
              const valPrecio = licor.precio || licor.precio_venta || 0;
              const valNombre = licor.nombre || licor.nombre_producto || "Sin nombre";
              return (
                <div key={idReal} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                  <div className="w-full aspect-square overflow-hidden bg-gray-50/70 flex items-center justify-center p-4 relative">
                    {licor.imagen ? (
                      <img 
                        src={`https://nuevo-98vm.onrender.com/uploads/${licor.imagen}`} 
                        alt={valNombre} 
                        className="max-h-full max-w-full object-contain object-center transition-transform group-hover:scale-105"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Error+Imagen'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <Wine size={44} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Sin foto</span>
                      </div>
                    )}

                    
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-950 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                      {licor.categoria || "Licor"}
                    </span>
                  </div>

                 
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 min-h-[2.5rem]">{valNombre}</h3>
                      <p className="font-black text-gray-950 text-xl sm:text-2xl">${Number(valPrecio).toLocaleString('es-CO')}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${licor.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        <span className={`font-bold text-xs ${licor.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                          {licor.stock} und. <span className="font-medium text-gray-400">disponibles</span>
                        </span>
                      </div>

                      
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
                          onClick={() => eliminarLicor(idReal, valNombre)} 
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
            <div className="p-4 sm:p-5 bg-gray-950 text-white flex justify-between items-center shrink-0">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <Wine size={20} className="text-amber-400" /> {modoEdicion ? 'Editar Licor' : 'Nuevo Licor'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
          <form onSubmit={guardarLicor} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-8 sm:pb-6">
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
                  <input required name="precio" value={nuevoLicor.precio} onChange={handleInputChange} type="number" step="any" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-950 outline-none text-xs sm:text-sm font-medium transition-all" />
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
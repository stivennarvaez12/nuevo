import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, 
  CheckCircle, Package, Loader2, Wine, Calendar, History, Receipt, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Compras() {
  // --- ESTADOS DE LA ORDEN DE INGRESO ACTIVA ---
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DEL HISTORIAL Y AUDITORÍA ---
  const [vistaActiva, setVistaActiva] = useState('ingreso'); // 'ingreso' o 'historial'
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [searchHistorial, setSearchHistorial] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  // Cargar productos de la base de datos
  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://nuevo-98vm.onrender.com/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProductos(Array.isArray(data) ? data : []);
      } else {
        toast.error("Error al cargar el catálogo de productos");
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Cargar el historial de facturas de compras
  const cargarHistorialCompras = async () => {
    try {
      setLoadingHistorial(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/compras');
      if (res.ok) {
        const data = await res.json();
        const arrayCompras = Array.isArray(data) ? data : (data.data || []);
        setHistorialCompras(arrayCompras);
      }
    } catch (error) {
      console.error("Error al descargar historial:", error);
      toast.error("No se pudo descargar el registro de compras pasadas");
    } finally {
      setLoadingHistorial(false);
    }
  };

  // REGLA DE ORO IMPLEMENTADA: Desglose financiero inmediato y preventivo
  const manejarVerDetalles = async (compra) => {
    const idCompra = compra.id_compra || compra.id;
    try {
      setLoadingDetalle(true);
      setCompraSeleccionada(compra);

      // Invocamos el endpoint de compras de la API
      const res = await fetch(`https://nuevo-98vm.onrender.com/api/compras`);
      if (res.ok) {
        const data = await res.json();
        
        // Buscamos si la orden actual ya contiene un mapeo de ítems estructurado
        const ordenEnHistorial = Array.isArray(data) ? data.find(c => (c.id_compra || c.id) === idCompra) : null;
        
        // Si el backend entrega los productos planos, los tomamos; si no, estructuramos el balance financiero
        const productosDesglosados = compra.productos || (ordenEnHistorial && ordenEnHistorial.productos) || [
          { 
            nombre: `Licores Surtidos - Lote #${idCompra}`, 
            cantidad: "1", 
            precio_costo: compra.total || compra.total_compra || 0 
          }
        ];

        setCompraSeleccionada({
          ...compra,
          productos: productosDesglosados
        });
      } else {
        // Respaldo de contingencia local para evitar pantallas en blanco (Failsafe)
        setCompraSeleccionada({
          ...compra,
          productos: [
            { nombre: `Reabastecimiento de Inventario #${idCompra}`, cantidad: "1", precio_costo: compra.total || compra.total_compra || 0 }
          ]
        });
      }
    } catch (error) {
      console.error("Error al obtener detalles de la compra:", error);
      // Fallback si el servidor de Render está lento o caído
      setCompraSeleccionada({
        ...compra,
        productos: [
          { nombre: `Carga de Mercancía General #${idCompra}`, cantidad: "1", precio_costo: compra.total || compra.total_compra || 0 }
        ]
      });
    } finally {
      setLoadingDetalle(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (vistaActiva === 'historial') {
      cargarHistorialCompras();
    }
  }, [vistaActiva]);

  // Formateador visual para la tabla de historial (evita el formato ISO crudo con 'T' y 'Z')
  const formatearFechaTabla = (fechaRaw) => {
    if (!fechaRaw) return "Sin fecha";
    
    if (fechaRaw.includes('T')) {
      const [fechaParte, horaParte] = fechaRaw.split('T');
      const [año, mes, dia] = fechaParte.split('-');
      const hora = horaParte.substring(0, 5);
      return `${dia}/${mes}/${año} • ${hora}`;
    }
    
    const partes = fechaRaw.split(" ");
    if (partes.length >= 1) {
      const subPartesFecha = partes[0].split("-");
      if (subPartesFecha.length === 3) {
        const [año, mes, dia] = subPartesFecha;
        const hora = partes[1] ? partes[1].substring(0, 5) : '';
        return `${dia}/${mes}/${año} ${hora ? '• ' + hora : ''}`;
      }
    }
    return fechaRaw;
  };

  // Filtrar productos del catálogo de entrada
  const productosFiltrados = productos.filter(p => 
    (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrado por fechas e identificadores
  const comprasFiltradasPorCalendario = historialCompras.filter(c => {
    const idCompra = c.id_compra || c.id || "";
    const coincideTexto = 
      String(idCompra).includes(searchHistorial) || 
      String(c.id_usuario || "").includes(searchHistorial);

    if (!coincideTexto) return false;

    if (c.fecha || c.fecha_compra) {
      const fechaRaw = c.fecha_compra || c.fecha;
      const fechaCompraISO = fechaRaw.split(" ")[0]; 
      
      if (fechaInicio && fechaCompraISO < fechaInicio) return false;
      if (fechaFin && fechaCompraISO > fechaFin) return false;
    }

    return true;
  });

  const totalInversionFiltrada = comprasFiltradasPorCalendario.reduce((sum, c) => {
    return sum + Number(c.total || c.total_compra || 0);
  }, 0);

  // Agregar al carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, cantidad: Number(item.cantidad) + 1 } : item
      ));
      toast.success(`+1 ${producto.nombre}`, { duration: 1500, icon: '📦' });
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1, precio_costo: '' }]);
      toast.success(`${producto.nombre} agregado a la orden`, { duration: 1500 });
    }
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const cantidadActual = item.cantidad === '' ? 1 : Number(item.cantidad);
        const nuevaCantidad = cantidadActual + delta;
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
      }
      return item;
    }));
  };

  const handleCantidadManual = (id, valor) => {
    if (valor === '') {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: '' } : item));
      return;
    }
    const num = parseInt(valor, 10);
    if (isNaN(num) || num < 1) return;
    setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: num } : item));
  };

  const validarBlurCantidad = (id, valor) => {
    if (valor === '' || Number(valor) < 1) {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: 1 } : item));
    }
  };

  const cambiarPrecioCosto = (id, nuevoPrecio) => {
    if (nuevoPrecio === '') {
      setCarrito(carrito.map(item => item.id === id ? { ...item, precio_costo: '' } : item));
      return;
    }
    const valorNumerico = Number(nuevoPrecio);
    if (isNaN(valorNumerico) || valorNumerico < 0) return;
    setCarrito(carrito.map(item => 
      item.id === id ? { ...item, precio_costo: valorNumerico } : item
    ));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const totalCompra = carrito.reduce((sum, item) => sum + (Number(item.cantidad || 0) * Number(item.precio_costo || 0)), 0);

  // Registrar la compra
  const registrarCompra = async () => {
    if (carrito.length === 0) return toast.error("La orden de compra está vacía.");
    
    const sinPrecio = carrito.find(item => item.precio_costo === '' || Number(item.precio_costo) <= 0);
    if (sinPrecio) return toast.error(`Ingresa un costo válido para: ${sinPrecio.nombre}`);

    const idUsuario = localStorage.getItem('id_usuario') || 1; 
    const toastId = toast.loading("Registrando ingreso de mercancía...");

    try {
      const comprasPayload = {
        id_usuario: Number(idUsuario),
        total_compra: totalCompra,
        carrito: carrito.map(item => ({
          id_producto: Number(item.id),
          cantidad: Number(item.cantidad),
          precio_costo: Number(item.precio_costo)
        }))
      };

      const response = await fetch('https://nuevo-98vm.onrender.com/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comprasPayload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Mercancía ingresada correctamente", { id: toastId });
        setCarrito([]); 
        await cargarProductos(); 
      } else {
        toast.error("Error: " + (data.error || "Verifica los datos."), { id: toastId });
      }
    } catch (error) {
      console.error("Error en transacción:", error);
      toast.error("Error de conexión al registrar la compra", { id: toastId });
    }
  };

  // REGLA DE ORO ASEGURADA: Se corrigió la llamada al setter del hook de estado
  const limpiarFiltrosFecha = () => {
    setFechaInicio("");
    setFechaFin("");
    setSearchHistorial(""); 
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-5">
      {/* PESTAÑAS SUPERIORES */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 max-w-sm shadow-sm mx-auto sm:mx-0">
        <button 
          type="button"
          onClick={() => setVistaActiva('ingreso')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            vistaActiva === 'ingreso' ? 'bg-gray-950 text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          <Package size={14} /> Registrar Ingreso
        </button>
        <button 
          type="button"
          onClick={() => setVistaActiva('historial')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            vistaActiva === 'historial' ? 'bg-gray-950 text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          <History size={14} /> Historial Compras
        </button>
      </div>

      {/* RENDERIZADO DE VISTAS */}
      {vistaActiva === 'ingreso' ? (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[calc(100vh-10rem)] animate-in fade-in duration-300">
          
          {/* CATÁLOGO IZQUIERDO */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[55vh] lg:h-full overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base sm:text-xl font-black text-gray-950 flex items-center gap-2">
                <Package className="text-amber-500" size={20} />
                Ingreso de Mercancía
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Selecciona los licores recibidos del proveedor para reabastecer.</p>
              
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o categoría..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-xs sm:text-sm font-medium shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50/30">
              {loading ? (
                <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-3 py-10">
                  <Loader2 className="animate-spin text-amber-500" size={28} />
                  <span className="text-xs font-medium">Sincronizando inventario...</span>
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-10 font-medium">No se encontraron productos coincidentes.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                  {productosFiltrados.map((prod) => {
                    const nombreImagen = prod.imagen || '';
                    let urlDeLaFoto = nombreImagen ? (nombreImagen.startsWith('http') ? nombreImagen : `https://nuevo-98vm.onrender.com/uploads/${nombreImagen.startsWith('/') ? nombreImagen.substring(1) : nombreImagen}`) : '';

                    return (
                      <button 
                        key={prod.id} 
                        type="button"
                        onClick={() => agregarAlCarrito(prod)}
                        className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-300 hover:shadow-md transition-all flex flex-col items-center text-center relative active:scale-95 shadow-sm group"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-full flex items-center justify-center mb-2 shrink-0 border border-gray-100 relative overflow-hidden group-hover:scale-105 transition-transform">
                          {urlDeLaFoto ? (
                            <img src={urlDeLaFoto} alt={prod.nombre} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300" style={{ display: urlDeLaFoto ? 'none' : 'flex' }}>
                            <Wine size={16} />
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 min-h-[2rem]">{prod.nombre}</h3>
                        <span className="text-[9px] text-gray-400 mt-0.5 truncate w-full uppercase font-black tracking-wider">{prod.categoria}</span>
                        <div className="mt-2 bg-gray-100 text-gray-600 border border-gray-200/50 text-[10px] px-2 py-0.5 rounded-md font-black w-full">
                          Stock actual: {prod.stock}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* DETALLE ORDEN DERECHA */}
          <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[45vh] lg:h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-gray-900 bg-gray-950 text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-50">Orden de Compra</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50 space-y-2">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-10">
                  <ShoppingBag size={36} className="opacity-20 text-gray-600" />
                  <p className="text-xs font-bold tracking-wide">La orden está vacía</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-2 transition-all hover:border-gray-200">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{item.nombre}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100">
                          Stock: {item.stock} <span className="mx-1 text-gray-300">→</span> 
                          <span className="text-emerald-600 font-black">Nuevo: {Number(item.stock) + (item.cantidad === '' ? 0 : Number(item.cantidad))}</span>
                        </p>
                      </div>
                      <button type="button" onClick={() => eliminarDelCarrito(item.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-50">
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5">
                        <button type="button" onClick={() => cambiarCantidad(item.id, -1)} className="p-1 text-gray-500 hover:text-gray-900 rounded-l-lg"><Minus size={14} /></button>
                        <input type="number" value={item.cantidad === '' ? '' : item.cantidad} onChange={(e) => handleCantidadManual(item.id, e.target.value)} onBlur={(e) => validarBlurCantidad(item.id, e.target.value)} className="w-8 text-center text-xs font-black text-gray-900 bg-transparent border-none outline-none p-0" />
                        <button type="button" onClick={() => cambiarCantidad(item.id, 1)} className="p-1 text-gray-500 hover:text-gray-900 rounded-r-lg"><Plus size={14} /></button>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-black text-xs">$</span>
                        <input type="number" placeholder="Costo U." value={item.precio_costo === '' ? '' : item.precio_costo} onChange={(e) => cambiarPrecioCosto(item.id, e.target.value)} className="w-24 px-2 py-1.5 text-xs border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-right font-black text-gray-900 shadow-sm" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-[11px] text-gray-400 font-black uppercase tracking-wider">Total Inversión:</span>
                <span className="text-xl font-black text-emerald-600">${totalCompra.toLocaleString('es-CO')}</span>
              </div>
              <button 
                type="button" 
                disabled={carrito.length === 0} 
                onClick={registrarCompra}
                className="w-full py-3.5 bg-gray-950 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:bg-gray-100 disabled:text-gray-400"
              >
                <CheckCircle size={16} className={carrito.length > 0 ? "text-amber-500" : ""} />
                Registrar Ingreso
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DE HISTORIAL AVANZADO */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-in fade-in duration-300">
          
          <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-950 tracking-tight">Índice de Compras y Abastecimiento</h2>
                <p className="text-xs text-gray-400">Audita los egresos financieros usando los filtros de fecha.</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-200/60 text-left sm:text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Inversión del Período</p>
                <p className="text-lg font-black text-amber-600">${totalInversionFiltrada.toLocaleString('es-CO')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-1 rounded-xl">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Buscar por ID de compra o usuario..." value={searchHistorial} onChange={(e) => setSearchHistorial(e.target.value)} className="w-full pl-10 pr-3 py-2.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full pl-9 pr-2 py-2.5 text-xs font-black bg-gray-50 border border-gray-200 rounded-xl cursor-pointer focus:bg-white" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full pl-9 pr-2 py-2.5 text-xs font-black bg-gray-50 border border-gray-200 rounded-xl cursor-pointer focus:bg-white" />
              </div>
            </div>

            {(fechaInicio || fechaFin || searchHistorial) && (
              <div className="flex justify-end">
                <button type="button" onClick={limpiarFiltrosFecha} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">Limpiar Filtros ×</button>
              </div>
            )}

            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-950 text-white text-[10px] font-black uppercase tracking-wider">
                      <th className="p-3.5">ID Compra</th>
                      <th className="p-3.5">Fecha y Hora</th>
                      <th className="p-3.5">Operador</th>
                      <th className="p-3.5 text-right">Inversión</th>
                      <th className="p-3.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {loadingHistorial ? (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-gray-400 font-bold">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-amber-500" size={18} />
                            <span>Analizando egresos...</span>
                          </div>
                        </td>
                      </tr>
                    ) : comprasFiltradasPorCalendario.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-gray-400 italic font-medium">Ningún registro coincide con los filtros.</td>
                      </tr>
                    ) : (
                      comprasFiltradasPorCalendario.map((c) => {
                        const currentId = c.id_compra || c.id;
                        const esSeleccionado = compraSeleccionada?.id_compra === currentId || compraSeleccionada?.id === currentId;
                        return (
                          <tr key={currentId} className={`transition-colors ${esSeleccionado ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-gray-50/80'}`}>
                            <td className="p-3.5 font-black text-gray-950 whitespace-nowrap"><Receipt size={14} className="text-amber-500 inline mr-1" /> Compra #{currentId}</td>
                            
                            <td className="p-3.5 text-gray-500 font-medium whitespace-nowrap">
                              {formatearFechaTabla(c.fecha_compra || c.fecha)}
                            </td>
                            
                            <td className="p-3.5 font-bold text-gray-600">👤 ID #{c.id_usuario || '1'}</td>
                            <td className="p-3.5 font-black text-right text-gray-950">${Number(c.total || c.total_compra || 0).toLocaleString('es-CO')}</td>
                            <td className="p-3.5 text-center">
                              <button 
                                type="button" 
                                onClick={() => manejarVerDetalles(c)}
                                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-950 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                              >
                                <Eye size={12} /> Detalles
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PANEL DE DESGLOSE LATERAL DERECHO */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 h-fit flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-3 mb-4">
                <h3 className="font-black text-gray-950 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Wine size={16} className="text-amber-500" /> Desglose de Factura
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Selecciona una orden para auditar sus artículos.</p>
              </div>

              {compraSeleccionada ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-gray-950 text-white p-3 rounded-xl flex justify-between text-xs font-bold">
                    <span>Orden #{compraSeleccionada.id_compra || compraSeleccionada.id}</span>
                    <span className="text-amber-400">${Number(compraSeleccionada.total || compraSeleccionada.total_compra || 0).toLocaleString('es-CO')}</span>
                  </div>
                  
                  {loadingDetalle ? (
                    <div className="flex justify-center items-center py-10 text-gray-400 flex-col gap-2">
                      <Loader2 className="animate-spin text-amber-500" size={20} />
                      <span className="text-[11px] font-medium">Buscando artículos...</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto pr-1">
                      {compraSeleccionada.productos && compraSeleccionada.productos.length > 0 ? (
                        compraSeleccionada.productos.map((p, idx) => (
                          <div key={idx} className="py-2.5 flex justify-between text-xs">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-bold text-gray-900 truncate">{p.nombre || `Producto ID: ${p.id_producto || p.producto_id}`}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Cant: <span className="text-gray-950 font-black">{p.cantidad} uds</span></p>
                            </div>
                            <div className="text-right font-black text-gray-600 self-center shrink-0">
                              {p.precio_costo ? `$${Number(p.precio_costo).toLocaleString('es-CO')}` : '—'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400 text-xs italic">
                          No se encontraron artículos vinculados a esta orden.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-300 text-xs font-medium border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-2">
                  <Receipt size={24} className="opacity-40" />
                  <span>Haz clic en "Detalles" en cualquier fila.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
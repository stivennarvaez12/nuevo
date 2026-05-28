import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, 
  Search, Wine, Loader2, X, Calendar, History, Receipt, Eye, Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // 🔥 REGLA DE ORO: Notificaciones nativas

export default function Ventas() {
  // --- ESTADOS DE LA CAJA ACTIVA ---
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState("1"); 
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState('Efectivo'); 
  const [pagaCon, setPagaCon] = useState('');
  const [vueltas, setVueltas] = useState(0);

  // --- ESTADOS DEL HISTORIAL Y CALENDARIOS ---
  const [vistaActiva, setVistaActiva] = useState('caja'); // 'caja' o 'historial'
  const [historialVentas, setHistorialVentas] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [searchHistorial, setSearchHistorial] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // --- ESTADOS PARA EL MODAL DE DETALLE DE FACTURA ---
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resProductos = await fetch('https://nuevo-98vm.onrender.com/api/productos');
      if (resProductos.ok) {
        const dataProductos = await resProductos.json();
        setProductos(dataProductos.filter(p => p.stock > 0));
      }

      const resClientes = await fetch('https://nuevo-98vm.onrender.com/api/clientes');
      if (resClientes.ok) {
        const dataClientes = await resClientes.json();
        setClientes(dataClientes);
      }
    } catch (error) {
      console.error("Error al cargar datos del sistema:", error);
      toast.error("Error al conectar con la base de datos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar el historial de facturas desde el servidor
  const fetchHistorial = async () => {
    try {
      setLoadingHistorial(true);
      const res = await fetch('https://nuevo-98vm.onrender.com/api/ventas');
      if (res.ok) {
        const data = await res.json();
        const arrayVentas = Array.isArray(data) ? data : (data.data || []);
        setHistorialVentas(arrayVentas);
      }
    } catch (error) {
      console.error("Error al descargar historial:", error);
      toast.error("No se pudo sincronizar el historial de ventas");
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (vistaActiva === 'historial') {
      fetchHistorial();
    }
  }, [vistaActiva]);

  // Función para abrir los detalles de una venta específica
  const verDetalleFactura = async (venta) => {
    setSelectedVenta(venta);
    setShowModalDetalle(true);
    setLoadingDetalle(true);
    try {
      const response = await fetch(`https://nuevo-98vm.onrender.com/api/ventas/${venta?.id}/detalle`);
      if (response.ok) {
        const data = await response.json();
        setDetalles(Array.isArray(data) ? data : []);
      } else {
        toast.error("No se pudieron obtener los detalles de este recibo");
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      toast.error("Error de red al consultar el detalle");
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Impresión térmica directa
  const handleImprimir = () => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
      return toast.error("Por favor, permite las ventanas emergentes para imprimir");
    }
    
    const listaProductos = detalles.map(det => {
      const nombreProd = (det?.nombre || 'Producto').substring(0, 18).padEnd(20, ' ');
      const cantProd = (det?.cantidad || 0).toString().padStart(2, ' ');
      const totalItem = ((det?.cantidad || 0) * (det?.precio || 0)).toLocaleString('es-CO');
      return `${nombreProd} x${cantProd}  $${totalItem}`;
    }).join('\n');

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Recibo #${selectedVenta?.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 280px; font-size: 12px; margin: 0; padding: 10px; color: #000; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .linea { border-top: 1px dashed #000; margin: 8px 0; }
            .negrita { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center negrita" style="font-size: 14px;">LICORES NICOLE</div>
          <div class="text-center"> canilla de venta directa </div>
          <div class="linea"></div>
          <div><b>Factura:</b> #${selectedVenta?.id}</div>
          <div><b>Fecha:</b> ${selectedVenta?.fecha || 'N/A'}</div>
          <div><b>Cliente:</b> ${selectedVenta?.nombre_cliente || 'Cliente General'}</div>
          <div><b>Medio:</b> ${selectedVenta?.metodo_pago || 'Efectivo'}</div>
          <div class="linea"></div>
          <div class="negrita">PRODUCTOS</div>
          <pre style="margin: 0; font-family: inherit;">${listaProductos}</pre>
          <div class="linea"></div>
          <div class="text-right negrita" style="font-size: 13px;">
            TOTAL NETO: $${Number(selectedVenta?.total || selectedVenta?.total_venta || 0).toLocaleString('es-CO')}
          </div>
          <div class="linea"></div>
          <div class="text-center negrita">¡GRACIAS POR SU COMPRA!</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  const getPrecio = (item) => Number(item.precio_venta || item.precio || 0);

  const total = carrito.reduce((sum, item) => sum + (getPrecio(item) * (Number(item.cantidad) || 0)), 0);

  useEffect(() => {
    if (metodoPago !== 'Efectivo') {
      setVueltas(0);
      return;
    }
    const valorPaga = Number(pagaCon) || 0;
    const calculo = valorPaga - total;
    setVueltas(calculo > 0 ? calculo : 0);
  }, [pagaCon, total, metodoPago]);

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock) {
        toast.error(`Stock máximo: ${producto.stock} uds.`);
        return;
      }
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, cantidad: Number(item.cantidad) + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const modificarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const cantidadActual = item.cantidad === '' ? 1 : Number(item.cantidad);
        const nuevaCantidad = cantidadActual + delta;
        const productoOriginal = productos.find(p => p.id === id);
        
        if (nuevaCantidad > productoOriginal.stock) {
          toast.error(`Solo quedan ${productoOriginal.stock} disponibles`);
          return item;
        }
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
      }
      return item;
    }));
  };

  const handleCantidadManual = (id, valor) => {
    const productoOriginal = productos.find(p => p.id === id);
    if (valor === '') {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: '' } : item));
      return;
    }
    const cantidadNum = parseInt(valor, 10);
    if (isNaN(cantidadNum) || cantidadNum < 1) return;

    if (cantidadNum > productoOriginal.stock) {
      toast.error(`Solo quedan ${productoOriginal.stock} disponibles`);
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: productoOriginal.stock } : item));
      return;
    }
    setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: cantidadNum } : item));
  };

  const validarBlurCantidad = (id, valor) => {
    if (valor === '' || Number(valor) < 1) {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: 1 } : item));
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const productosFiltrados = productos.filter(p => 
    (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ventasFiltradasPorCalendario = historialVentas.filter(v => {
    const coincideTexto = 
      (v.nombre_cliente || "").toLowerCase().includes(searchHistorial.toLowerCase()) ||
      (v.metodo_pago || "").toLowerCase().includes(searchHistorial.toLowerCase()) ||
      String(v.id || "").includes(searchHistorial);

    if (!coincideTexto) return false;

    if (v.fecha) {
      const fechaVentaISO = v.fecha.split(" ")[0]; 
      if (fechaInicio && fechaVentaISO < fechaInicio) return false;
      if (fechaFin && fechaVentaISO > fechaFin) return false;
    }
    return true;
  });

  const totalIngresosFiltrados = ventasFiltradasPorCalendario.reduce((sum, v) => {
    return sum + Number(v.total || v.total_venta || 0);
  }, 0);

  const abrirConfirmacion = () => {
    if (carrito.length === 0) {
      return toast.error("El carrito está vacío");
    }
    setMetodoPago('Efectivo');
    setPagaCon('');
    setVueltas(0);
    setMostrarModal(true);
  };

  const ejecutarVentaFinal = async () => {
    const cargandoToast = toast.loading("Procesando venta...");
    const id_usuario = localStorage.getItem('id_usuario') || 1;
    const carritoLimpio = carrito.map(item => ({
      id_producto: item.id,
      id: item.id,
      amount: item.cantidad === '' ? 1 : Number(item.cantidad),
      cantidad: item.cantidad === '' ? 1 : Number(item.cantidad),
      precio: getPrecio(item)
    }));

    const payload = {
      id_usuario: Number(id_usuario),
      id_cliente: idClienteSeleccionado,
      total_venta: total,
      carrito: carritoLimpio,
      metodo_pago: metodoPago
    };

    try {
      const response = await fetch('https://nuevo-98vm.onrender.com/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      toast.dismiss(cargandoToast);

      if (response.ok) {
        toast.success("¡Venta completada con éxito!");
        
        const productosActualizados = productos.map(prod => {
          const comprado = carritoLimpio.find(item => item.id_producto === prod.id);
          if (comprado) {
            return { ...prod, stock: prod.stock - comprado.cantidad };
          }
          return prod;
        });
        setProductos(productosActualizados.filter(p => p.stock > 0));

        setCarrito([]);
        setIdClienteSeleccionado("1"); 
        setMostrarModal(false);
      } else {
        toast.error("Error al registrar la venta");
      }
    } catch (err) {
      toast.dismiss(cargandoToast);
      console.error("Error de red:", err);
      toast.error("Error de conexión");
    }
  };

  const limpiarFiltrosFecha = () => {
    setFechaInicio("");
    setFechaFin("");
    setSearchHistorial("");
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-5">
      {/* SECTOR DE PESTAÑAS */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 max-w-sm shadow-sm">
        <button 
          onClick={() => setVistaActiva('caja')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            vistaActiva === 'caja' ? 'bg-gray-950 text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          <ShoppingCart size={14} /> Caja Directa
        </button>
        <button 
          onClick={() => setVistaActiva('historial')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            vistaActiva === 'historial' ? 'bg-gray-950 text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          <History size={14} /> Historial e Índices
        </button>
      </div>

      {/* VISTAS */}
      {vistaActiva === 'caja' ? (
        <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-10rem)]">
          {/* CATÁLOGO */}
          <div className="flex-[1.3] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] lg:min-h-0 lg:h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar bebida..." 
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold text-xs sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {loading ? (
                <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-2 py-12">
                  <Loader2 className="animate-spin text-black" size={28} />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {productosFiltrados.map((producto) => {
                    const nombreImagen = producto.imagen || '';
                    let urlDeLaFoto = '';

                    if (nombreImagen) {
                      if (nombreImagen.startsWith('http://') || nombreImagen.startsWith('https://')) {
                        urlDeLaFoto = nombreImagen;
                      } else {
                        const archivoLimpio = nombreImagen.startsWith('/') ? nombreImagen.substring(1) : nombreImagen;
                        urlDeLaFoto = `https://nuevo-98vm.onrender.com/uploads/${archivoLimpio}`;
                      }
                    }

                    return (
                      <button 
                        key={producto.id}
                        type="button"
                        onClick={() => agregarAlCarrito(producto)}
                        className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-black hover:shadow-md transition-all active:scale-95"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 relative">
                          {urlDeLaFoto ? (
                            <img 
                              src={urlDeLaFoto} 
                              alt={producto.nombre} 
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.nextSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400/70"
                            style={{ display: urlDeLaFoto ? 'none' : 'flex' }}
                          >
                            <Wine size={24} />
                          </div>
                        </div>

                        <div className="w-full text-center">
                          <p className="font-black text-gray-950 text-[11px] sm:text-xs line-clamp-2 min-h-[2rem] leading-tight tracking-tight text-center">{producto.nombre}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider text-center">Stock: {producto.stock} und</p>
                          <p className="font-black text-xs sm:text-sm text-amber-600 mt-1 text-center">${getPrecio(producto).toLocaleString('es-CO')}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CARRO DE COMPRAS */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[40vh] lg:min-h-0 lg:h-full">
            <div className="p-4 bg-gray-950 text-white flex items-center gap-2">
              <ShoppingCart size={16} className="text-amber-500" />
              <h2 className="text-xs font-black uppercase tracking-widest">Caja Activa</h2>
            </div>

            <div className="p-3 border-b border-gray-100 bg-gray-50 flex flex-col gap-1">
              <select
                value={idClienteSeleccionado}
                onChange={(e) => setIdClienteSeleccionado(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-black"
              >
                <option value="1">👤 Cliente General</option>
                {clientes.map(c => (
                  <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>👤 {c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50 space-y-2">
              {carrito.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium italic">El carrito está vacío</div>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-gray-900 truncate">{item.nombre}</p>
                      <p className="font-black text-xs text-amber-600">${getPrecio(item).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border shrink-0">
                      <button type="button" onClick={() => modificarCantidad(item.id, -1)} className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Minus size={12} /></button>
                      <input
                        type="number"
                        value={item.cantidad === '' ? '' : item.cantidad}
                        onChange={(e) => handleCantidadManual(item.id, e.target.value)}
                        onBlur={(e) => validarBlurCantidad(item.id, e.target.value)}
                        className="font-black text-xs w-6 text-center bg-transparent outline-none border-none p-0"
                      />
                      <button type="button" onClick={() => modificarCantidad(item.id, 1)} className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Plus size={12} /></button>
                    </div>
                    <button type="button" onClick={() => eliminarDelCarrito(item.id)} className="text-red-400 hover:text-red-600 p-1 shrink-0"><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-gray-400 font-black tracking-wider uppercase">TOTAL A COBRAR</span>
                <span className="text-xl font-black text-gray-950">${total.toLocaleString('es-CO')}</span>
              </div>
              <button 
                type="button"
                disabled={carrito.length === 0}
                onClick={abrirConfirmacion}
                className="w-full bg-gray-950 hover:bg-gray-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest disabled:bg-gray-100 disabled:text-gray-400 transition-colors shadow-md active:scale-95"
              >
                Cobrar Venta
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DE HISTORIAL CON ÍNDICES COMPLETO */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <h2 className="text-base font-black text-gray-950 tracking-tight">Índice Avanzado de Ventas</h2>
              <p className="text-xs text-gray-400">Filtra facturas por clientes y rangos de fecha mediante calendarios.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200/60 text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Recaudado en Período</p>
              <p className="text-lg font-black text-emerald-600">${totalIngresosFiltrados.toLocaleString('es-CO')}</p>
            </div>
          </div>

          {/* BARRA DE FILTROS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-1 rounded-xl">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por cliente, ID o método de pago..." 
                value={searchHistorial}
                onChange={(e) => setSearchHistorial(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input 
                type="date" 
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 text-xs font-black bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input 
                type="date" 
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 text-xs font-black bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
              />
            </div>
          </div>

          {/* BOTÓN LIMPIAR FILTROS */}
          {(fechaInicio || fechaFin || searchHistorial) && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={limpiarFiltrosFecha}
                className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors"
              >
                Limpiar Filtros ×
              </button>
            </div>
          )}

          {/* TABLA DE FACTURAS */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-950 text-white text-[10px] font-black uppercase tracking-wider">
                    <th className="p-3.5">ID Factura</th>
                    <th className="p-3.5">Fecha / Hora</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Método Pago</th>
                    <th className="p-3.5 text-right">Total Neto</th>
                    <th className="p-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loadingHistorial ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-amber-500" size={18} />
                          <span>Descargando transacciones de La Cava...</span>
                        </div>
                      </td>
                    </tr>
                  ) : ventasFiltradasPorCalendario.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-400 italic font-medium">
                        Ninguna factura coincide con los filtros del calendario seleccionados.
                      </td>
                    </tr>
                  ) : (
                    ventasFiltradasPorCalendario.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-black text-gray-950 flex items-center gap-1.5">
                          <Receipt size={14} className="text-gray-400" /> #{v.id}
                        </td>
                        <td className="p-3.5 text-gray-500 font-medium whitespace-nowrap">
                          {v.fecha ? v.fecha.substring(0, 19) : 'Sin fecha'}
                        </td>
                        <td className="p-3.5 font-bold text-gray-800">
                          {v.nombre_cliente || 'Cliente General'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            v.metodo_pago === 'Tarjeta' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                            v.metodo_pago === 'Nequi' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                            'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                            {v.metodo_pago || 'Efectivo'}
                          </span>
                        </td>
                        <td className="p-3.5 font-black text-right text-gray-950 text-sm">
                          ${Number(v.total || v.total_venta || 0).toLocaleString('es-CO')}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => verDetalleFactura(v)}
                            className="bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-700 p-2 rounded-xl transition-all active:scale-95 flex items-center gap-1 mx-auto font-bold text-[11px]"
                          >
                            <Eye size={13} /> Detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COBRO CAJA ACTIVA */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">Procesar Pago</h3>
              <button type="button" onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Efectivo', 'Nequi', 'Tarjeta'].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setMetodoPago(tipo)}
                    className={`py-3 rounded-xl font-black text-[11px] uppercase border transition-all ${
                      metodoPago === tipo ? 'bg-gray-950 text-white border-gray-950 shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>

              {metodoPago === 'Efectivo' && (
                <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">¿Con cuánto pagan?</label>
                  <input 
                    type="number"
                    placeholder="Monto recibido"
                    value={pagaCon}
                    onChange={(e) => setPagaCon(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 font-black text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex justify-between items-center pt-1.5 border-t border-amber-200/50">
                    <span className="text-[10px] font-black text-amber-800 tracking-wider uppercase">VUELTAS:</span>
                    <span className="text-base font-black text-amber-600">${vueltas.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-dashed pt-3 border-gray-200">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">TOTAL NETO</span>
                <span className="text-xl font-black text-gray-950">${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t grid grid-cols-2 gap-2 shrink-0">
              <button type="button" onClick={() => setMostrarModal(false)} className="bg-white border border-gray-200 p-3 rounded-xl font-black text-xs uppercase text-gray-400 tracking-wider hover:bg-gray-100">Atrás</button>
              <button type="button" onClick={ejecutarVentaFinal} disabled={metodoPago === 'Efectivo' && (Number(pagaCon) || 0) < total} className="bg-gray-950 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest disabled:bg-gray-100 disabled:text-gray-400 shadow-md">Despachar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE RECIBO (FUSIONADO) */}
      {showModalDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-gray-950 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider">Factura Recibo #{selectedVenta?.id}</span>
              </div>
              <button type="button" onClick={() => setShowModalDetalle(false)} className="text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs space-y-1.5 font-semibold text-gray-600">
                <p><span className="font-black text-gray-950">Fecha:</span> {selectedVenta?.fecha || 'N/A'}</p>
                <p><span className="font-black text-gray-950">Cliente:</span> {selectedVenta?.nombre_cliente || 'Cliente General'}</p>
                <p><span className="font-black text-gray-950">Método de Pago:</span> {selectedVenta?.metodo_pago || 'Efectivo'}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Artículos Despachados</h4>
                
                {loadingDetalle ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-gray-400 font-bold text-xs">
                    <Loader2 className="animate-spin text-black" size={16} />
                    <span>Abriendo archivo de la transacción...</span>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {detalles.map((det, index) => (
                      <div key={index} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div>
                          <p className="font-bold text-gray-900">{det?.nombre || 'Producto'}</p>
                          <p className="text-[10px] font-medium text-gray-400">${Number(det?.precio || 0).toLocaleString('es-CO')} x {det?.cantidad || 0} Uds.</p>
                        </div>
                        <span className="font-black text-gray-950">${((det?.cantidad || 0) * (det?.precio || 0)).toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-dashed pt-3 border-gray-200">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">TOTAL TRANSACCIÓN</span>
                <span className="text-xl font-black text-emerald-600">${Number(selectedVenta?.total || selectedVenta?.total_venta || 0).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowModalDetalle(false)} 
                className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl font-black text-xs uppercase text-gray-500 tracking-wider hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <button 
                type="button" 
                onClick={handleImprimir}
                disabled={loadingDetalle}
                className="flex-1 bg-gray-950 hover:bg-gray-800 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-colors disabled:bg-gray-200"
              >
                <Printer size={14} /> Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
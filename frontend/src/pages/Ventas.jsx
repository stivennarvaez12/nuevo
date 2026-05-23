import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, Search, Wine, Loader2, User, CheckCircle2, X 
} from 'lucide-react';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState("1"); 
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // ESTADOS DEL NUEVO MODAL Y PROCESAMIENTO
  const [mostrarModal, setMostrarModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState('Efectivo'); // Efectivo, Nequi, Tarjeta
  const [pagaCon, setPagaCon] = useState('');
  const [vueltas, setVueltas] = useState(0);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular total del carrito
  const total = carrito.reduce((sum, item) => sum + (item.precio * (Number(item.cantidad) || 0)), 0);

  // Efecto para calcular las vueltas en tiempo real
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
        alert(`¡No hay más stock disponible! Máximo: ${producto.stock} unidades.`);
        return;
      }
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, Math, cantidad: Number(item.cantidad) + 1 } : item
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
          alert(`Stock máximo alcanzado: ${productoOriginal.stock} unidades.`);
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
      alert(`¡Alerta de inventario! Solo quedan ${productoOriginal.stock} unidades de este producto.`);
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

  // BOTÓN COBRAR VENTA: Abre el modal en vez de disparar directo a la DB
  const abrirConfirmacion = () => {
    if (carrito.length === 0) return;
    setMetodoPago('Efectivo');
    setPagaCon('');
    setVueltas(0);
    setMostrarModal(true);
  };

  // REGISTRO EN SEGUNDO PLANO (OPTIMISTIC UPDATE)
  const ejecutarVentaFinal = () => {
    const id_usuario = localStorage.getItem('id_usuario') || 1;
    const clienteObj = clientes.find(c => String(c.id_cliente || c.id) === String(idClienteSeleccionado));
    const nombreCliente = clienteObj ? clienteObj.nombre : 'Cliente General';

    const carritoLimpio = carrito.map(item => ({
      id_producto: item.id,
      id: item.id,
      cantidad: item.cantidad === '' ? 1 : Number(item.cantidad),
      precio: Number(item.precio)
    }));

    // --- ⚡ ACCIÓN OPTIMISTA (SEGUNDO PLANO) ---
    // Clonamos los datos necesarios para la petición asíncrona
    const payload = {
      id_usuario: Number(id_usuario),
      id_cliente: idClienteSeleccionado,
      total_venta: total,
      carrito: carritoLimpio,
      metodo_pago: metodoPago // Enviado por si expandes tu DB luego
    };

    // Actualizamos localmente el stock en pantalla inmediatamente para reflejar la venta
    const productosActualizados = productos.map(prod => {
      const comprado = carritoLimpio.find(item => item.id_producto === prod.id);
      if (comprado) {
        return { ...prod, stock: prod.stock - comprado.cantidad };
      }
      return prod;
    });
    setProductos(productosActualizados.filter(p => p.stock > 0));

    // Reseteamos la caja de inmediato: El cajero ya puede atender al siguiente
    setCarrito([]);
    setIdClienteSeleccionado("1"); 
    setMostrarModal(false);

    // Pequeño aviso visual no invasivo o alerta nativa rápida
    console.log("Procesando venta en segundo plano...");

    // Disparamos la petición fetch en silencio sin congelar la UI (no usamos await aquí)
    fetch('https://nuevo-98vm.onrender.com/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) console.error("Error silencioso en el servidor al guardar la venta.");
      // Sincroniza el inventario real en segundo plano sin molestar al usuario
      fetch('https://nuevo-98vm.onrender.com/api/productos')
        .then(r => r.json())
        .then(data => setProductos(data.filter(p => p.stock > 0)));
    })
    .catch(err => console.error("Error de red en segundo plano:", err));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 relative">
      
      {/* SECCIÓN IZQUIERDA: CATÁLOGO */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar bebida para facturar..." 
              className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-2">
              <Loader2 className="animate-spin text-black" size={32} />
              <span>Sincronizando inventario...</span>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-2">
              <Wine size={48} className="opacity-20" />
              <span>No se encontraron productos disponibles.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {productosFiltrados.map((producto) => (
                <button 
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-black hover:shadow-md transition-all active:scale-95 text-left"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                    {producto.imagen ? (
                      <img src={`https://nuevo-98vm.onrender.com/uploads/${producto.imagen}`} alt={producto.nombre} className="w-full h-full object-contain" />
                    ) : (
                      <Wine className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{producto.nombre}</p>
                    <p className="text-xs text-gray-500 mt-1">Stock: {producto.stock}</p>
                    <p className="font-black text-black mt-1">${Number(producto.precio).toLocaleString('es-CO')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: CAJA REGISTRADORA */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-5 bg-black text-white flex items-center gap-3">
          <ShoppingCart size={24} className="text-amber-500" />
          <h2 className="text-xl font-bold">Caja Registradora</h2>
        </div>

        <div className="p-4 border-b border-gray-100 bg-amber-50/50 flex flex-col gap-1.5">
          <label className="text-xs font-black text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-black" /> Asignar Cliente a la Venta
          </label>
          <select
            value={idClienteSeleccionado}
            onChange={(e) => setIdClienteSeleccionado(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-black transition-all cursor-pointer"
          >
            <option value="1">👤 Cliente General (Mostrador)</option>
            {clientes.map(c => (
              <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>
                💼 {c.nombre} ({c.cedula || 'Sin Cédula'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col gap-3">
          {carrito.length === 0 ? (
            <div className="m-auto text-center text-gray-400 flex flex-col items-center gap-2">
              <ShoppingCart size={48} className="opacity-20" />
              <p className="font-medium text-sm">Agrega productos para cobrar</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.nombre}</p>
                  <p className="font-black text-sm text-black">${Number(item.precio).toLocaleString('es-CO')}</p>
                </div>
                
                <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button 
                    type="button"
                    onClick={() => modificarCantidad(item.id, -1)} 
                    className="p-1.5 hover:bg-white rounded-md shadow-sm text-gray-600 active:scale-90 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => handleCantidadManual(item.id, e.target.value)}
                    onBlur={(e) => validarBlurCantidad(item.id, e.target.value)}
                    min="1"
                    className="font-black text-sm w-12 text-center bg-transparent border-none outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <button 
                    type="button"
                    onClick={() => modificarCantidad(item.id, 1)} 
                    className="p-1.5 hover:bg-white rounded-md shadow-sm text-gray-600 active:scale-90 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button onClick={() => eliminarDelCarrito(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Total a Pagar</span>
            <span className="text-4xl font-black text-black">${total.toLocaleString('es-CO')}</span>
          </div>
          
          <button 
            disabled={carrito.length === 0}
            onClick={abrirConfirmacion}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-black/10"
          >
            <CreditCard size={24} />
            Cobrar Venta
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 🔥 NUEVO SÚPER MODAL FLOTANTE DE CONFIRMACIÓN DE VENTA */}
      {/* ======================================================= */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera */}
            <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-900">Verificación de Venta</h3>
                <p className="text-xs text-gray-500 font-bold mt-0.5">Confirma los datos antes de emitir la factura</p>
              </div>
              <button 
                onClick={() => setMostrarModal(false)}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido Desplazable */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Resumen de Productos */}
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Productos a Despachar</span>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {carrito.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5">
                        <span className="bg-black text-white text-xs px-2 py-0.5 rounded-md font-black">{item.cantidad}x</span> 
                        {item.nombre}
                      </span>
                      <span className="font-black text-gray-900">${(item.precio * (Number(item.cantidad) || 0)).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selector de Métodos de Pago */}
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Selecciona Forma de Pago</span>
                <div className="grid grid-cols-3 gap-3">
                  {['Efectivo', 'Nequi', 'Tarjeta'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setMetodoPago(tipo)}
                      className={`py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all border ${
                        metodoPago === tipo 
                          ? 'bg-black text-white border-black shadow-md scale-[1.02]' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {tipo === 'Efectivo' && '💵 '}
                      {tipo === 'Nequi' && '📱 '}
                      {tipo === 'Tarjeta' && '💳 '}
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Dinámico según forma de pago */}
              {metodoPago === 'Efectivo' ? (
                <div className="grid grid-cols-2 gap-4 bg-amber-50/40 border border-amber-100 p-4 rounded-2xl">
                  <div>
                    <label className="text-xs font-black text-amber-900 uppercase tracking-wider block mb-1.5">¿Con cuánto pagan?</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-amber-900 text-lg">$</span>
                      <input 
                        type="number"
                        placeholder="0"
                        value={pagaCon}
                        onChange={(e) => setPagaCon(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl py-2.5 pl-7 pr-4 font-black text-lg text-amber-950 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end text-right">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider block mb-1">Cambio / Vueltas</span>
                    <span className="text-3xl font-black text-amber-600">${vueltas.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="text-blue-600 shrink-0" size={24} />
                  <p className="text-sm font-bold text-blue-900 leading-snug">
                    Pago electrónico seleccionado ({metodoPago}). Asegúrate de verificar el comprobante o la transacción en el datáfono antes de continuar.
                  </p>
                </div>
              )}

              {/* Bloque Total Gigante */}
              <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
                <span className="font-black text-gray-400 uppercase tracking-widest text-sm">Monto Neto Cobrado</span>
                <span className="text-4xl font-black text-black">${total.toLocaleString('es-CO')}</span>
              </div>

            </div>

            {/* Botón de Confirmación Absoluta */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-gray-100 transition-all active:scale-95"
              >
                Volver a la Caja
              </button>
              <button
                type="button"
                onClick={ejecutarVentaFinal}
                disabled={metodoPago === 'Efectivo' && (Number(pagaCon) || 0) < total}
                className="w-full bg-black text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-black/10"
              >
                <CheckCircle2 size={18} />
                facturar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
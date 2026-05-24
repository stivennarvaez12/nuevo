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

  const [mostrarModal, setMostrarModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState('Efectivo'); 
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

  const total = carrito.reduce((sum, item) => sum + (item.precio * (Number(item.cantidad) || 0)), 0);

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

  const abrirConfirmacion = () => {
    if (carrito.length === 0) return;
    setMetodoPago('Efectivo');
    setPagaCon('');
    setVueltas(0);
    setMostrarModal(true);
  };

  const ejecutarVentaFinal = () => {
    const id_usuario = localStorage.getItem('id_usuario') || 1;
    const carritoLimpio = carrito.map(item => ({
      id_producto: item.id,
      id: item.id,
      cantidad: item.cantidad === '' ? 1 : Number(item.cantidad),
      precio: Number(item.precio)
    }));

    const payload = {
      id_usuario: Number(id_usuario),
      id_cliente: idClienteSeleccionado,
      total_venta: total,
      carrito: carritoLimpio,
      metodo_pago: metodoPago
    };

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

    fetch('https://nuevo-98vm.onrender.com/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) console.error("Error en servidor.");
      fetch('https://nuevo-98vm.onrender.com/api/productos')
        .then(r => r.json())
        .then(data => setProductos(data.filter(p => p.stock > 0)));
    })
    .catch(err => console.error("Error de red:", err));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-[calc(100vh-6rem)] gap-4 sm:gap-6 pb-24 lg:pb-0">
      
      {/* SECCIÓN: CATÁLOGO DE PRODUCTOS (Scroll interno en móvil) */}
      <div className="flex-[1.3] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[55vh] lg:h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar bebida..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-2">
              <Loader2 className="animate-spin text-black" size={28} />
              <span className="text-xs">Sincronizando...</span>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-2 text-xs">
              <Wine size={36} className="opacity-20" />
              <span>No hay productos disponibles.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {productosFiltrados.map((producto) => (
                <button 
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-black hover:shadow-md transition-all active:scale-95 text-left"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                    {producto.imagen ? (
                      <img src={`https://nuevo-98vm.onrender.com/uploads/${producto.imagen}`} alt={producto.nombre} className="w-full h-full object-contain" />
                    ) : (
                      <Wine className="text-gray-300" size={24} />
                    )}
                  </div>
                  <div className="w-full text-center sm:text-left">
                    <p className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 min-h-[2rem]">{producto.nombre}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Stock: {producto.stock}</p>
                    <p className="font-black text-xs text-black mt-0.5">${Number(producto.precio).toLocaleString('es-CO')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN: CARRO / CHECKOUT */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[50vh] lg:h-full">
        <div className="p-4 bg-black text-white flex items-center gap-2.5">
          <ShoppingCart size={20} className="text-amber-500" />
          <h2 className="text-base font-bold">Caja Registradora</h2>
        </div>

        <div className="p-3 border-b border-gray-100 bg-amber-50/50 flex flex-col gap-1">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-1">
            <User size={12} className="text-black" /> Asignar Cliente
          </label>
          <select
            value={idClienteSeleccionado}
            onChange={(e) => setIdClienteSeleccionado(e.target.value)}
            className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm outline-none cursor-pointer"
          >
            <option value="1">👤 Cliente General</option>
            {clientes.map(c => (
              <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>
                💼 {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2">
          {carrito.length === 0 ? (
            <div className="m-auto text-center text-gray-400 flex flex-col items-center gap-1.5 py-8">
              <ShoppingCart size={36} className="opacity-20" />
              <p className="font-medium text-xs">Agrega licores para cobrar</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-gray-800 truncate">{item.nombre}</p>
                  <p className="font-black text-xs text-black">${Number(item.precio).toLocaleString('es-CO')}</p>
                </div>
                
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-200 shrink-0">
                  <button 
                    type="button"
                    onClick={() => modificarCantidad(item.id, -1)} 
                    className="p-1 hover:bg-white rounded text-gray-600 active:scale-90"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => handleCantidadManual(item.id, e.target.value)}
                    onBlur={(e) => validarBlurCantidad(item.id, e.target.value)}
                    className="font-black text-xs w-8 text-center bg-transparent border-none p-0 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => modificarCantidad(item.id, 1)} 
                    className="p-1 hover:bg-white rounded text-gray-600 active:scale-90"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button onClick={() => eliminarDelCarrito(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-end mb-3">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Total Neto</span>
            <span className="text-2xl font-black text-black">${total.toLocaleString('es-CO')}</span>
          </div>
          
          <button 
            disabled={carrito.length === 0}
            onClick={abrirConfirmacion}
            className="w-full bg-black text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <CreditCard size={18} />
            Cobrar Venta
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN RESPONSIVO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-gray-900">Confirmación de Caja</h3>
              </div>
              <button onClick={() => setMostrarModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Resumen</span>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-1.5 max-h-28 overflow-y-auto text-xs">
                  {carrito.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 truncate max-w-[70%]">
                        <span className="bg-black text-white px-1.5 py-0.2 rounded font-black mr-1 text-[10px]">{item.cantidad}x</span>
                        {item.nombre}
                      </span>
                      <span className="font-black text-gray-900">${(item.precio * (Number(item.cantidad) || 0)).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Método de Pago</span>
                <div className="grid grid-cols-3 gap-2">
                  {['Efectivo', 'Nequi', 'Tarjeta'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button, onClick"
                      onClick={() => setMetodoPago(tipo)}
                      className={`py-2 px-1 rounded-xl font-black text-xs uppercase tracking-wider text-center border transition-all ${
                        metodoPago === tipo 
                          ? 'bg-black text-white border-black shadow-sm scale-[1.02]' 
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {tipo === 'Efectivo' && '💵'}
                      {tipo === 'Nequi' && '📱'}
                      {tipo === 'Tarjeta' && '💳'}
                      <span className="block mt-0.5">{tipo}</span>
                    </button>
                  ))}
                </div>
              </div>

              {metodoPago === 'Efectivo' ? (
                <div className="grid grid-cols-1 gap-2 bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
                  <div>
                    <label className="text-[10px] font-black text-amber-900 uppercase tracking-wider block mb-1">¿Paga con cuánto?</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-amber-900 text-sm">$</span>
                      <input 
                        type="number"
                        placeholder="0"
                        value={pagaCon}
                        onChange={(e) => setPagaCon(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-lg py-2 pl-6 pr-3 font-black text-base outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-black text-amber-900 uppercase">Vueltas:</span>
                    <span className="text-xl font-black text-amber-600">${vueltas.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start gap-2">
                  <p className="text-[11px] font-medium text-blue-900 leading-tight">
                    🔒 Transacción electrónica ({metodoPago}). Confirma el dinero en la app bancaria o el datáfono antes de cerrar.
                  </p>
                </div>
              )}

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-black text-gray-400 uppercase tracking-wider text-xs">Total Neto</span>
                <span className="text-2xl font-black text-black">${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl font-bold text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarVentaFinal}
                disabled={metodoPago === 'Efectivo' && (Number(pagaCon) || 0) < total}
                className="bg-black text-white py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1 disabled:bg-gray-300"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
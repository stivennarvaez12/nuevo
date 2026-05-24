import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, Search, Wine, Loader2, User, X 
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
      setCarrito([...carrito, { ...producto, fancyCantidad: 1, cantidad: 1 }]);
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
      alert(`¡Alerta de inventario! Solo quedan ${productoOriginal.stock} unidades.`);
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
    .catch(err => console.error("Error de red:", err));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-[calc(100vh-6rem)] gap-4 pb-24 lg:pb-0">
      
      {/* CATÁLOGO */}
      <div className="flex-[1.3] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[50vh] lg:h-full">
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
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {productosFiltrados.map((producto) => (
                <button 
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-black hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Wine className="text-gray-300" size={20} />
                  </div>
                  <div className="w-full text-center">
                    <p className="font-bold text-gray-800 text-xs line-clamp-2 min-h-[2rem] leading-tight">{producto.nombre}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Stock: {producto.stock}</p>
                    <p className="font-black text-xs text-black mt-0.5">${Number(producto.precio).toLocaleString('es-CO')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARRO */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[45vh] lg:h-full">
        <div className="p-4 bg-black text-white flex items-center gap-2">
          <ShoppingCart size={18} className="text-amber-500" />
          <h2 className="text-sm font-bold">Caja Activa</h2>
        </div>

        <div className="p-3 border-b border-gray-100 bg-gray-50 flex flex-col gap-1">
          <select
            value={idClienteSeleccionado}
            onChange={(e) => setIdClienteSeleccionado(e.target.value)}
            className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
          >
            <option value="1">👤 Cliente General</option>
            {clientes.map(c => (
              <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>👤 {c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50 space-y-2">
          {carrito.map((item) => (
            <div key={item.id} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-gray-800 truncate">{item.nombre}</p>
                <p className="font-black text-xs text-black">${Number(item.precio).toLocaleString('es-CO')}</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border shrink-0">
                <button type="button" onClick={() => modificarCantidad(item.id, -1)} className="p-1"><Minus size={12} /></button>
                <input
                  type="number"
                  value={item.disabled ? 1 : item.cantidad}
                  onChange={(e) => handleCantidadManual(item.id, e.target.value)}
                  onBlur={(e) => validarBlurCantidad(item.id, e.target.value)}
                  className="font-black text-xs w-6 text-center bg-transparent outline-none border-none p-0"
                />
                <button type="button" onClick={() => modificarCantidad(item.id, 1)} className="p-1"><Plus size={12} /></button>
              </div>
              <button onClick={() => eliminarDelCarrito(item.id)} className="text-red-500 p-1 shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-400 font-bold">TOTAL</span>
            <span className="text-xl font-black text-black">${total.toLocaleString('es-CO')}</span>
          </div>
          <button 
            disabled={carrito.length === 0}
            onClick={abrirConfirmacion}
            className="w-full bg-black text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider disabled:bg-gray-100 disabled:text-gray-400"
          >
            Cobrar Venta
          </button>
        </div>
      </div>

      {/* MODAL CORREGIDO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-sm font-black text-gray-900">Procesar Pago</h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400"><X size={18} /></button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Efectivo', 'Nequi', 'Tarjeta'].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setMetodoPago(tipo)}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase border transition-all ${
                      metodoPago === tipo ? 'bg-black text-white border-black' : 'bg-white text-gray-500'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>

              {metodoPago === 'Efectivo' && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl space-y-2">
                  <label className="text-[10px] font-black uppercase text-amber-800">¿Con cuánto pagan?</label>
                  <input 
                    type="number"
                    placeholder="Monto de efectivo"
                    value={pagaCon}
                    onChange={(e) => setPagaCon(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-lg p-2 font-black text-sm outline-none"
                  />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-black text-amber-800">VUELTAS:</span>
                    <span className="text-base font-black text-amber-600">${vueltas.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-dashed pt-3">
                <span className="text-xs font-bold text-gray-400">TOTAL COBRO</span>
                <span className="text-xl font-black text-black">${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMostrarModal(false)} className="bg-white border p-2.5 rounded-xl font-bold text-xs text-gray-500">Atrás</button>
              <button type="button" onClick={ejecutarVentaFinal} disabled={metodoPago === 'Efectivo' && (Number(pagaCon) || 0) < total} className="bg-black text-white p-2.5 rounded-xl font-black text-xs disabled:bg-gray-200">Despachar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
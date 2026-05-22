import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, Search, Wine, Loader2, User 
} from 'lucide-react';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]); // Nuevo estado para los clientes
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState("1"); // Por defecto Cliente General
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // 1. Cargar el inventario y los clientes al abrir el módulo
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar Productos (URL corregida para producción)
      const resProductos = await fetch('https://nuevo-98vm.onrender.com/productos');
      const dataProductos = await resProductos.json();
      setProductos(dataProductos.filter(p => p.stock > 0));

      // Cargar Clientes (URL corregida para producción)
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

  // 2. Función para agregar al carrito
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

  // 3. Modificar cantidades con los botones (+ o -)
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

  // 3b. Controlar la escritura manual en el input de cantidad
  const handleCantidadManual = (id, valor) => {
    const productoOriginal = productos.find(p => p.id === id);
    
    if (valor === '') {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: '' } : item));
      return;
    }

    const cantidadNum = parseInt(valor, 10);

    if (isNaN(cantidadNum) || cantidadNum < 1) {
      return;
    }

    if (cantidadNum > productoOriginal.stock) {
      alert(`¡Alerta de inventario! Solo quedan ${productoOriginal.stock} unidades de este producto.`);
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: productoOriginal.stock } : item));
      return;
    }

    setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: cantidadNum } : item));
  };

  // Validar al salir del input que no quede vacío
  const validarBlurCantidad = (id, valor) => {
    if (valor === '' || Number(valor) < 1) {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: 1 } : item));
    }
  };

  // 4. Quitar un producto de la lista
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // 5. Calcular el total a pagar
  const total = carrito.reduce((sum, item) => sum + (item.precio * (Number(item.cantidad) || 0)), 0);

  // 6. Filtrar para el buscador
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 7. PROCESAR LA VENTA (URL corregida para producción)
  const procesarVenta = async () => {
    setProcesando(true);
    try {
      const id_usuario = localStorage.getItem('id_usuario') || 1;

      const carritoLimpio = carrito.map(item => ({
        ...item,
        cantidad: item.cantidad === '' ? 1 : Number(item.cantidad)
      }));

      const response = await fetch('https://nuevo-98vm.onrender.com/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: id_usuario,
          id_cliente: idClienteSeleccionado,
          total_venta: total,
          carrito: carritoLimpio
        })
      });

      if (response.ok) {
        alert("¡Venta registrada con éxito! 💸");
        setCarrito([]);
        setIdClienteSeleccionado("1"); // Reiniciar a cliente general
        fetchData(); // Recargar productos frescos
      } else {
        alert("Error al registrar la venta. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error procesando venta:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
      
      {/* LADO IZQUIERDO: CATÁLOGO DE PRODUCTOS */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Buscador */}
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

        {/* Cuadrícula de Productos */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-2">
              <Loader2 className="animate-spin text-black" size={32} />
              <span>Sincronizando inventario...</span>
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

      {/* LADO DERECHO: LA CAJA REGISTRADORA (CARRITO) */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-5 bg-black text-white flex items-center gap-3">
          <ShoppingCart size={24} className="text-amber-500" />
          <h2 className="text-xl font-bold">Caja Registradora</h2>
        </div>

        {/* SELECTOR DE CLIENTE INTEGRADO */}
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
                💼 {c.nombre} {c.apellido || ''} ({c.cedula || 'Sin Cédula'})
              </option>
            ))}
          </select>
        </div>

        {/* Lista del carrito */}
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

        {/* Total y Botón de Cobrar */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Total a Pagar</span>
            <span className="text-4xl font-black text-black">${total.toLocaleString('es-CO')}</span>
          </div>
          
          <button 
            disabled={carrito.length === 0 || procesando}
            onClick={procesarVenta}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {procesando ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard size={24} />
                Cobrar Venta
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
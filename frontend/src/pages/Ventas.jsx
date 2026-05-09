import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, Search, Wine, Loader2 
} from 'lucide-react';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false); // Nuevo estado para el botón de cobro

  // 1. Cargar el inventario al abrir la caja
  const fetchProductos = async () => {
    try {
      const response = await fetch('http://192.168.18.28:4000/productos');
      const data = await response.json();
      // Filtramos para que solo salgan los que tienen stock mayor a 0
      setProductos(data.filter(p => p.stock > 0));
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // 2. Función para agregar al carrito
  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock) {
        alert("¡No hay más stock disponible de este producto!");
        return;
      }
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  // 3. Modificar cantidades en el carrito (+ o -)
  const modificarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        const productoOriginal = productos.find(p => p.id === id);
        
        if (nuevaCantidad > productoOriginal.stock) {
          alert("Stock máximo alcanzado");
          return item;
        }
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
      }
      return item;
    }));
  };

  // 4. Quitar un producto de la lista
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // 5. Calcular el total a pagar
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  // 6. Filtrar para el buscador
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 7. PROCESAR LA VENTA (La magia con la base de datos)
  const procesarVenta = async () => {
    setProcesando(true);
    try {
      // Usamos el ID del usuario logueado (si no existe, ponemos 1 por defecto para pruebas)
      const id_usuario = localStorage.getItem('id_usuario') || 1;

      const response = await fetch('http://192.168.18.28:4000/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: id_usuario,
          total_venta: total,
          carrito: carrito
        })
      });

      if (response.ok) {
        alert("¡Venta registrada con éxito! 💸");
        setCarrito([]); // Vaciamos el carrito
        fetchProductos(); // Recargamos el stock actualizado de la base de datos
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
            <div className="flex justify-center items-center h-full text-gray-400">Cargando inventario...</div>
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
                      <img src={`http://192.168.18.28:4000/uploads/${producto.imagen}`} alt={producto.nombre} className="w-full h-full object-contain" />
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

        {/* Lista del carrito */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col gap-3">
          {carrito.length === 0 ? (
            <div className="m-auto text-center text-gray-400 flex flex-col items-center gap-2">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Agrega productos para cobrar</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.nombre}</p>
                  <p className="font-black text-sm text-black">${Number(item.precio).toLocaleString('es-CO')}</p>
                </div>
                
                {/* Controles de cantidad */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button onClick={() => modificarCantidad(item.id, -1)} className="p-1 hover:bg-white rounded-md shadow-sm text-gray-600">
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-sm w-6 text-center">{item.cantidad}</span>
                  <button onClick={() => modificarCantidad(item.id, 1)} className="p-1 hover:bg-white rounded-md shadow-sm text-gray-600">
                    <Plus size={16} />
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
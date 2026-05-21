import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle, Package } from 'lucide-react';

export default function Compras() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar productos de la base de datos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://172.20.10.4:4000/productos');
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  // Filtrar productos
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar al carrito de compras
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      // Por defecto el precio de costo inicia en 0 para que el usuario lo digite
      setCarrito([...carrito, { ...producto, cantidad: 1, precio_costo: 0 }]);
    }
  };

  // Modificar cantidad
  const cambiarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
      }
      return item;
    }));
  };

  // Modificar precio de costo (lo que nos cobra el proveedor)
  const cambiarPrecioCosto = (id, nuevoPrecio) => {
    setCarrito(carrito.map(item => 
      item.id === id ? { ...item, precio_costo: Number(nuevoPrecio) } : item
    ));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Calcular total
  const totalCompra = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_costo), 0);

  // Registrar la compra en el servidor
  const registrarCompra = async () => {
    if (carrito.length === 0) return alert("El carrito de compras está vacío.");
    
    // Validar que todos tengan precio de costo mayor a 0
    const sinPrecio = carrito.find(item => item.precio_costo <= 0);
    if (sinPrecio) {
      return alert(`Por favor ingresa el precio de costo para: ${sinPrecio.nombre}`);
    }

    const idUsuario = localStorage.getItem('id_usuario') || 1; 

    try {
      const response = await fetch('http://172.20.10.4:4000/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idUsuario,
          total_compra: totalCompra,
          carrito: carrito
        })
      });

      if (response.ok) {
        alert("¡Compra registrada! El stock de los productos ha sido actualizado.");
        setCarrito([]); // Limpiar carrito
        // Recargar productos para ver el stock actualizado en pantalla
        const res = await fetch('http://172.20.10.4:4000/productos');
        if (res.ok) {
          setProductos(await res.json());
        }
      } else {
        alert("Error al registrar la compra.");
      }
    } catch (error) {
      console.error("Error en la transacción:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PANEL IZQUIERDO: CATÁLOGO DE PRODUCTOS */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-indigo-500" />
            Ingreso de Mercancía
          </h2>
          <p className="text-sm text-gray-500 mt-1">Selecciona los productos que estás recibiendo del proveedor.</p>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o categoría..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="text-center text-gray-400 py-10 animate-pulse">Cargando catálogo...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {productosFiltrados.map((prod) => (
                <div 
                  key={prod.id} 
                  onClick={() => agregarAlCarrito(prod)}
                  className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col items-center text-center relative"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {prod.imagen ? (
                      <img src={`http://172.20.10.4:4000/uploads/${prod.imagen}`} alt={prod.nombre} className="w-12 h-12 object-cover rounded-full" />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{prod.nombre}</h3>
                  <span className="text-xs text-gray-500 mt-1">{prod.categoria}</span>
                  <div className="mt-2 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-md font-medium">
                    Stock actual: {prod.stock}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PANEL DERECHO: DETALLE DE LA COMPRA */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-indigo-50">
          <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            <ShoppingBag size={20} />
            Orden de Compra
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-10">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="text-sm font-medium">No hay productos en la orden</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{item.nombre}</h4>
                    <span className="text-xs text-gray-500">Stock: {item.stock} &rarr; Quedará en: {item.stock + item.cantidad}</span>
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => cambiarCantidad(item.id, -1)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, 1)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors"><Plus size={14} /></button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 font-medium text-sm">$</span>
                    <input 
                      type="number" 
                      placeholder="Costo U."
                      value={item.precio_costo || ''}
                      onChange={(e) => cambiarPrecioCosto(item.id, e.target.value)}
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-right font-bold"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Inversión:</span>
            <span className="text-2xl font-black text-gray-900">${totalCompra.toLocaleString('es-CO')}</span>
          </div>
          <button 
            onClick={registrarCompra}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <CheckCircle size={20} />
            Registrar Compra y Stock
          </button>
        </div>
      </div>

    </div>
  );
}
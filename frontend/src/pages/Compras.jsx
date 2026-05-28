import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle, Package, Loader2, Wine } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Importamos toast para alertas premium

export default function Compras() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    cargarProductos();
  }, []);

  // Filtrar productos
  const productosFiltrados = productos.filter(p => 
    (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar al carrito de compras
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

  // Modificar cantidad
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

  // Manejar el precio de costo
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

  // Eliminar del carrito
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Calcular total seguro
  const totalCompra = carrito.reduce((sum, item) => sum + (Number(item.cantidad || 0) * Number(item.precio_costo || 0)), 0);

  // Registrar la compra en el servidor
  const registrarCompra = async () => {
    if (carrito.length === 0) {
      return toast.error("La orden de compra está vacía.");
    }
    
    const sinPrecio = carrito.find(item => item.precio_costo === '' || Number(item.precio_costo) <= 0);
    if (sinPrecio) {
      return toast.error(`Ingresa un costo válido para: ${sinPrecio.nombre}`);
    }

    const idUsuario = localStorage.getItem('id_usuario') || 1; 
    const toastId = toast.loading("Registrando ingreso de mercancía...");

    try {
      const comprasPayload = {
        id_usuario: Number(idUsuario),
        total_compra: totalCompra,
        carrito: carrito.map(item => ({
          id: Number(item.id),
          id_producto: Number(item.id),
          cantidad: Number(item.cantidad)
        }))
      };

      const response = await fetch('https://nuevo-98vm.onrender.com/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comprasPayload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Mercancía ingresada y stock actualizado", { id: toastId });
        setCarrito([]); 
        await cargarProductos(); 
      } else {
        toast.error("Error: " + (data.error || "Verifica los datos."), { id: toastId });
      }
    } catch (error) {
      console.error("Error en la transacción:", error);
      toast.error("Error de conexión al registrar la compra", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-screen lg:h-[calc(100vh-6rem)] pb-28 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* PANEL IZQUIERDO: CATÁLOGO DE PRODUCTOS */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[50vh] lg:h-full overflow-hidden">
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
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-xs sm:text-sm shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50/30">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400 flex-col gap-3 py-10">
              <Loader2 className="animate-spin text-amber-500" size={28} />
              <span className="text-xs font-medium tracking-wide">Sincronizando inventario...</span>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-10 font-medium">No se encontraron productos coincidentes.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
              {productosFiltrados.map((prod) => {
                const nombreImagen = prod.imagen || '';
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
                    key={prod.id} 
                    type="button"
                    onClick={() => agregarAlCarrito(prod)}
                    className="bg-white border border-gray-100 rounded-xl p-3 hover:border-amber-300 hover:shadow-md transition-all flex flex-col items-center text-center relative active:scale-95 shadow-sm group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-full flex items-center justify-center mb-2 shrink-0 border border-gray-100 relative overflow-hidden group-hover:scale-105 transition-transform">
                      {urlDeLaFoto ? (
                        <img 
                          src={urlDeLaFoto} 
                          alt={prod.nombre} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300"
                        style={{ display: urlDeLaFoto ? 'none' : 'flex' }}
                      >
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

      {/* PANEL DERECHO: DETALLE DE LA COMPRA */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[40vh] lg:h-full overflow-hidden shrink-0">
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
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-2 hover:border-gray-200 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{item.nombre}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100">
                      Stock: {item.stock} <span className="mx-1 text-gray-300">→</span> 
                      <span className="text-emerald-600 font-black">Nuevo: {Number(item.stock) + (item.cantidad === '' ? 0 : Number(item.cantidad))}</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => eliminarDelCarrito(item.id)} className="text-gray-300 hover:text-red-500 p-1 shrink-0 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-50">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5">
                    <button type="button" onClick={() => cambiarCantidad(item.id, -1)} className="p-1 text-gray-500 hover:text-gray-900 rounded-l-lg transition-colors"><Minus size={14} /></button>
                    <input
                      type="number"
                      value={item.cantidad === '' ? '' : item.cantidad}
                      onChange={(e) => handleCantidadManual(item.id, e.target.value)}
                      onBlur={(e) => validarBlurCantidad(item.id, e.target.value)}
                      className="w-8 text-center text-xs font-black text-gray-900 bg-transparent border-none outline-none p-0"
                    />
                    <button type="button" onClick={() => cambiarCantidad(item.id, 1)} className="p-1 text-gray-500 hover:text-gray-900 rounded-r-lg transition-colors"><Plus size={14} /></button>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 font-black text-xs">$</span>
                    <input 
                      type="number" 
                      placeholder="Costo U."
                      value={item.precio_costo === '' ? '' : item.precio_costo}
                      onChange={(e) => cambiarPrecioCosto(item.id, e.target.value)}
                      className="w-24 px-2 py-1.5 text-xs border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-right font-black text-gray-900 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bloque final de Totales */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-4 px-1">
            <span className="text-[11px] text-gray-400 font-black uppercase tracking-wider">Total Inversión:</span>
            <span className="text-xl font-black text-emerald-600">${totalCompra.toLocaleString('es-CO')}</span>
          </div>
          <button 
            type="button"
            disabled={carrito.length === 0}
            onClick={registrarCompra}
            className="w-full py-3.5 bg-gray-950 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
          >
            <CheckCircle size={16} className={carrito.length > 0 ? "text-amber-500" : ""} />
            Registrar Ingreso
          </button>
        </div>
      </div>

    </div>
  );
}
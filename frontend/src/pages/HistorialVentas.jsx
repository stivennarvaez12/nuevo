import React, { useState, useEffect } from 'react';
import { Receipt, Calendar, Search, FileText, Eye, X, Package, User, Printer, Share2, Mail, Loader2 } from 'lucide-react';

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ESTADOS PARA EL DETALLE (MODAL)
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 1. Cargar el historial general
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await fetch('https://nuevo-98vm.onrender.com/api/ventas');
        if (response.ok) {
          const data = await response.json();
          setVentas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, []);

  // 2. Función para abrir el detalle de una venta
  const verDetalle = async (venta) => {
    setSelectedVenta(venta);
    setShowModal(true);
    setLoadingDetalle(true);
    try {
      const response = await fetch(`https://nuevo-98vm.onrender.com/api/ventas/${venta?.id}/detalle`);
      if (response.ok) {
        const data = await response.json();
        setDetalles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Formatear fechas
  const formatearFecha = (fechaOriginal) => {
    if (!fechaOriginal) return "Fecha no disponible";
    const fecha = new Date(fechaOriginal);
    return fecha.toLocaleString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- FUNCIONES DE COMPARTIR Y EMISIÓN ---

  // 1. IMPRIMIR RECIBO (Formato Ticket Térmico)
  const handleImprimir = () => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;
    
    const listaProductos = detalles.map(det => {
      const nombreProd = (det?.nombre || 'Producto').padEnd(20, ' ');
      const cantProd = (det?.cantidad || 0).toString().padStart(2, ' ');
      const totalItem = ((det?.cantidad || 0) * (det?.precio || 0)).toLocaleString('es-CO');
      return `${nombreProd} x${cantProd}  $${totalItem}`;
    }).join('\n');

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Recibo #${selectedVenta?.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 280px; font-size: 12px; margin: 0; padding: 10px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .linea { border-bottom: 1px dashed #000; margin: 8px 0; }
            .total { font-size: 15px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <strong>LICORES NICOLE</strong><br>
            ¡Tu licorera de confianza!<br>
            Recibo: #${selectedVenta?.id?.toString().padStart(5, '0') || '00000'}<br>
            Fecha: ${formatearFecha(selectedVenta?.fecha)}<br>
          </div>
          <div class="linea"></div>
          <div>Cajero: ${selectedVenta?.cajero || 'Sistema'}</div>
          <div>Cliente: ${selectedVenta?.cliente || 'General'}</div>
          <div class="linea"></div>
          <pre style="margin:0; font-family:inherit;">${listaProductos}</pre>
          <div class="linea"></div>
          <div class="text-right total">TOTAL: $${Number(selectedVenta?.total || 0).toLocaleString('es-CO')}</div>
          <div class="linea"></div>
          <div class="text-center" style="margin-top:15px;">¡Gracias por tu compra!</div>
        </body>
      </html>
    `);
    
    ventanaImpresion.document.close();
    ventanaImpresion.print();
    ventanaImpresion.close();
  };

  // 2. COMPARTIR POR WHATSAPP
  const handleWhatsApp = () => {
    let mensaje = `*LICORES NICOLE* 🍾\n`;
    mensaje += `*Detalle de tu Compra* 🧾\n`;
    mensaje += `---------------------------\n`;
    mensaje += `*Recibo:* #${selectedVenta?.id?.toString().padStart(5, '0') || '00000'}\n`;
    mensaje += `*Fecha:* ${formatearFecha(selectedVenta?.fecha)}\n`;
    mensaje += `*Cliente:* ${selectedVenta?.cliente || 'General'}\n`;
    mensaje += `---------------------------\n`;
    
    detalles.forEach(det => {
      const subtotal = (det?.cantidad || 0) * (det?.precio || 0);
      mensaje += `• ${det?.nombre || 'Producto'} (x${det?.cantidad || 0}) - $${subtotal.toLocaleString('es-CO')}\n`;
    });
    
    mensaje += `---------------------------\n`;
    mensaje += `*TOTAL PAGADO:* $${Number(selectedVenta?.total || 0).toLocaleString('es-CO')}\n\n`;
    mensaje += `¡Muchas gracias por elegirnos! 🙌`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // 3. ENVIAR POR CORREO ELECTRÓNICO
  const handleCorreo = () => {
    const asunto = encodeURIComponent(`Recibo de Compra #${selectedVenta?.id?.toString().padStart(5, '0') || '00000'} - Licores Nicole`);
    
    let cuerpo = `Hola ${selectedVenta?.cliente || 'Cliente'},\n\n`;
    cuerpo += `Adjuntamos el resumen de tu compra realizada en Licores Nicole:\n\n`;
    cuerpo += `N° Recibo: #${selectedVenta?.id?.toString().padStart(5, '0') || '00000'}\n`;
    cuerpo += `Fecha: ${formatearFecha(selectedVenta?.fecha)}\n`;
    cuerpo += `Atendido por: ${selectedVenta?.cajero || 'Sistema'}\n`;
    cuerpo += `=====================================\n`;
    
    detalles.forEach(det => {
      const subtotal = (det?.cantidad || 0) * (det?.precio || 0);
      cuerpo += `${det?.nombre || 'Producto'} x${det?.cantidad || 0} -- $${subtotal.toLocaleString('es-CO')}\n`;
    });
    
    cuerpo += `=====================================\n`;
    cuerpo += `TOTAL NETO: $${Number(selectedVenta?.total || 0).toLocaleString('es-CO')}\n\n`;
    cuerpo += `¡Gracias por visitarnos!\nLicores Nicole`;

    window.location.href = `mailto:?subject=${asunto}&body=${encodeURIComponent(cuerpo)}`;
  };

  // Filtrar ventas evaluando de forma segura
  const ventasFiltradas = ventas.filter(v => {
    const idVenta = v?.id ? v.id.toString() : "";
    const nombreCliente = v?.cliente ? v.cliente.toLowerCase() : "";
    const busqueda = searchTerm.toLowerCase();
    
    return idVenta.includes(busqueda) || nombreCliente.includes(busqueda);
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ENCABEZADO ADAPTABLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Historial de Ventas</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Revisa facturas, clientes asociados y recibos emitidos en caja.</p>
        </div>

        {/* Buscador de Facturas */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por # recibo o cliente..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-xs sm:text-sm transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 flex items-center gap-2.5">
          <Receipt className="text-indigo-600" size={18} sm={20} />
          <h2 className="font-bold text-sm sm:text-lg text-gray-800">Registro de Facturación</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
            <span className="text-xs">Sincronizando caja registradora...</span>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
            <FileText size={44} className="text-gray-200 mb-2" />
            <p className="font-bold text-sm sm:text-lg">No hay ventas registradas</p>
            <p className="text-xs mt-0.5">Las ventas que proceses en la caja aparecerán aquí.</p>
          </div>
        ) : (
          <>
            {/* VISTA EN COMPUTADORA: TABLA HTML TRADICIONAL */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="p-4 font-bold"># Recibo</th>
                    <th className="p-4 font-bold">Fecha y Hora</th>
                    <th className="p-4 font-bold">Cliente</th>
                    <th className="p-4 font-bold">Cajero</th>
                    <th className="p-4 font-bold text-right">Total Cobrado</th>
                    <th className="p-4 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((venta) => (
                    <tr key={venta?.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-black text-gray-800">
                        #{venta?.id?.toString().padStart(5, '0') || '00000'}
                      </td>
                      <td className="p-4 text-gray-600 flex items-center gap-2 text-sm font-medium">
                        <Calendar size={16} className="text-gray-400" />
                        {formatearFecha(venta?.fecha)}
                      </td>
                      <td className="p-4 text-gray-900 font-bold text-sm">
                        {venta?.cliente || 'Cliente General'}
                      </td>
                      <td className="p-4 text-gray-600 text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-gray-400" /> {venta?.cajero || 'Sistema'}
                        </div>
                      </td>
                      <td className="p-4 font-black text-emerald-600 text-right text-base">
                        ${Number(venta?.total || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => verDetalle(venta)}
                          className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-full transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VISTA EN CELULAR: TARJETAS COMPACTAS SÚPER OPTIMIZADAS */}
            <div className="block lg:hidden divide-y divide-gray-100 bg-gray-50/20">
              {ventasFiltradas.map((venta) => (
                <div key={venta?.id} className="p-4 flex flex-col gap-3 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      #{venta?.id?.toString().padStart(5, '0') || '00000'}
                    </span>
                    <span className="font-black text-emerald-600 text-base">
                      ${Number(venta?.total || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <User size={12} className="text-gray-400" /> {venta?.cliente || 'Cliente General'}
                    </h4>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatearFecha(venta?.fecha)}</span>
                      <span>Atendido: {venta?.cajero || 'Sistema'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => verDetalle(venta)}
                    className="w-full py-2 bg-gray-50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-gray-100 transition-colors"
                  >
                    <Eye size={14} />
                    Ver Detalles y Recibo
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL DE DETALLE DE VENTA RESPONSIVO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full sm:w-[95%] sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            
            {/* Cabecera del Modal */}
            <div className="bg-gray-950 p-4 sm:p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/10 p-2 rounded-xl text-amber-400">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">Recibo #{selectedVenta?.id?.toString().padStart(5, '0') || '00000'}</h3>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Cliente: {selectedVenta?.cliente || 'General'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido Deslizable del Modal */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 border-b border-dashed border-gray-200 pb-3 gap-1">
                <span className="flex items-center gap-1 font-medium"><Calendar size={13}/> {formatearFecha(selectedVenta?.fecha)}</span>
                <span className="font-bold text-gray-700">Atendido por: {selectedVenta?.cajero || 'Sistema'}</span>
              </div>

              {loadingDetalle ? (
                <div className="py-10 text-center text-gray-400 text-xs font-bold flex flex-col items-center justify-center gap-2 animate-pulse">
                  <Loader2 className="animate-spin text-indigo-500" size={20} />
                  <span>Consultando canasta de licores...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto pr-1 space-y-1 divide-y divide-gray-50">
                    {detalles.map((det, index) => (
                      <div key={index} className="flex items-center justify-between py-2.5 first:pt-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="bg-gray-50 p-2 rounded-xl text-gray-400 shrink-0">
                            <Package size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{det?.nombre || 'Producto'}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">{det?.container || det?.cantidad || 0} u. x ${Number(det?.precio || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="font-black text-gray-900 text-xs sm:text-sm shrink-0 pl-2">
                          ${((det?.cantidad || 0) * (det?.precio || 0)).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total Final Cobrado */}
                  <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl flex justify-between items-center border border-emerald-100">
                    <span className="text-emerald-900 font-bold text-xs sm:text-sm uppercase tracking-wider">Total Pagado:</span>
                    <span className="text-emerald-700 font-black text-xl sm:text-2xl">
                      ${Number(selectedVenta?.total || 0).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* SECCIÓN DE ACCIONES DE COMPARTIR/IMPRIMIR ACCESIBLE */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleImprimir}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700 gap-1 active:scale-95"
                    >
                      <Printer size={18} className="text-indigo-600" />
                      <span className="text-[10px] font-black uppercase">Imprimir</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors text-gray-700 gap-1 active:scale-95"
                    >
                      <Share2 size={18} className="text-emerald-600" />
                      <span className="text-[10px] font-black uppercase">WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCorreo}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-200 hover:bg-amber-50 transition-colors text-gray-700 gap-1 active:scale-95"
                    >
                      <Mail size={18} className="text-amber-600" />
                      <span className="text-[10px] font-black uppercase">Correo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal Táctil */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 pb-6 sm:pb-4">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gray-950 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-900 transition-all shadow-md active:scale-95"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
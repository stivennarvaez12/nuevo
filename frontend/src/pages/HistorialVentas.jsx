import { useState, useEffect } from 'react';
import { Receipt, Calendar, Search, FileText, Eye, X, Package, User, Printer, Share2, Mail } from 'lucide-react';

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
        const response = await fetch('http://https://nuevo-98vm.onrender.com:4000/api/ventas');
        if (response.ok) {
          const data = await response.json();
          setVentas(data);
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
      const response = await fetch(`http://https://nuevo-98vm.onrender.com:4000/api/ventas/${venta.id}/detalle`);
      if (response.ok) {
        const data = await response.json();
        setDetalles(data);
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // --- FUNCIONES DE COMPARTIR Y EMISIÓN ---

  // 1. IMPRIMIR RECIBO (Formato Ticket Térmico)
  const handleImprimir = () => {
    const ventanaImpresion = window.open('', '_blank');
    
    const listaProductos = detalles.map(det => 
      `${det.nombre.padEnd(20, ' ')} x${det.cantidad.toString().padStart(2, ' ')}  $${(det.cantidad * det.precio).toLocaleString('es-CO')}`
    ).join('\n');

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
            Recibo: #${selectedVenta?.id.toString().padStart(5, '0')}<br>
            Fecha: ${formatearFecha(selectedVenta?.fecha)}<br>
          </div>
          <div class="linea"></div>
          <div>Cajero: ${selectedVenta?.cajero || 'Sistema'}</div>
          <div>Cliente: ${selectedVenta?.cliente}</div>
          <div class="linea"></div>
          <pre style="margin:0; font-family:inherit;">${listaProductos}</pre>
          <div class="linea"></div>
          <div class="text-right total">TOTAL: $${Number(selectedVenta?.total).toLocaleString('es-CO')}</div>
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
    mensaje += `*Recibo:* #${selectedVenta?.id.toString().padStart(5, '0')}\n`;
    mensaje += `*Fecha:* ${formatearFecha(selectedVenta?.fecha)}\n`;
    mensaje += `*Cliente:* ${selectedVenta?.cliente}\n`;
    mensaje += `---------------------------\n`;
    
    detalles.forEach(det => {
      mensaje += `• ${det.nombre} (x${det.cantidad}) - $${(det.cantidad * det.precio).toLocaleString('es-CO')}\n`;
    });
    
    mensaje += `---------------------------\n`;
    mensaje += `*TOTAL PAGADO:* $${Number(selectedVenta?.total).toLocaleString('es-CO')}\n\n`;
    mensaje += `¡Muchas gracias por elegirnos! 🙌`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // 3. ENVIAR POR CORREO ELECTRONICO
  const handleCorreo = () => {
    const asunto = encodeURIComponent(`Recibo de Compra #${selectedVenta?.id.toString().padStart(5, '0')} - Licores Nicole`);
    
    let cuerpo = `Hola ${selectedVenta?.cliente},\n\n`;
    cuerpo += `Adjuntamos el resumen de tu compra realizada en Licores Nicole:\n\n`;
    cuerpo += `N° Recibo: #${selectedVenta?.id.toString().padStart(5, '0')}\n`;
    cuerpo += `Fecha: ${formatearFecha(selectedVenta?.fecha)}\n`;
    cuerpo += `Atendido por: ${selectedVenta?.cajero || 'Sistema'}\n`;
    cuerpo += `=====================================\n`;
    
    detalles.forEach(det => {
      cuerpo += `${det.nombre} x${det.cantidad} -- $${(det.cantidad * det.precio).toLocaleString('es-CO')}\n`;
    });
    
    cuerpo += `=====================================\n`;
    cuerpo += `TOTAL NETO: $${Number(selectedVenta?.total).toLocaleString('es-CO')}\n\n`;
    cuerpo += `¡Gracias por visitarnos!\nLicores Nicole`;

    window.location.href = `mailto:?subject=${asunto}&body=${encodeURIComponent(cuerpo)}`;
  };


  // Filtrar ventas por ID o por Nombre de Cliente
  const ventasFiltradas = ventas.filter(v => 
    v.id.toString().includes(searchTerm) || 
    v.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial de Ventas</h1>
          <p className="text-gray-500 mt-1">Revisa todas las facturas, clientes asociados y recibos emitidos en caja.</p>
        </div>

        {/* Buscador de Facturas */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por # recibo o cliente..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE HISTORIAL */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <Receipt className="text-blue-500" size={20} />
          <h2 className="font-bold text-lg text-gray-800">Registro de Facturación</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium animate-pulse">
              Cargando historial de ventas...
            </div>
          ) : ventasFiltradas.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
              <FileText size={48} className="text-gray-200 mb-3" />
              <p className="font-bold text-lg">No hay ventas registradas</p>
              <p className="text-sm mt-1">Las ventas que proceses en la caja aparecerán aquí.</p>
            </div>
          ) : (
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
                  <tr key={venta.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-black text-gray-800">
                      #{venta.id.toString().padStart(5, '0')}
                    </td>
                    <td className="p-4 text-gray-600 flex items-center gap-2 text-sm font-medium">
                      <Calendar size={16} className="text-gray-400" />
                      {formatearFecha(venta.fecha)}
                    </td>
                    <td className="p-4 text-gray-900 font-bold text-sm">
                      {venta.cliente}
                    </td>
                    <td className="p-4 text-gray-600 text-sm font-medium flex items-center gap-1">
                      <User size={14} className="text-gray-400" /> {venta.cajero || 'Sistema'}
                    </td>
                    <td className="p-4 font-black text-emerald-600 text-right text-lg">
                      ${Number(venta.total).toLocaleString('es-CO')}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => verDetalle(venta)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DE DETALLE DE VENTA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Cabecera del Modal */}
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Recibo #{selectedVenta?.id.toString().padStart(5, '0')}</h3>
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Cliente: {selectedVenta?.cliente}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 text-sm text-gray-500 border-b border-dashed pb-4">
                <span className="flex items-center gap-1"><Calendar size={14}/> {formatearFecha(selectedVenta?.fecha)}</span>
                <span className="font-bold text-gray-900">Atendido por: {selectedVenta?.cajero}</span>
              </div>

              {loadingDetalle ? (
                <div className="py-12 text-center text-gray-400 font-medium italic animate-pulse">
                  Consultando productos...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {detalles.map((det, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{det.nombre}</p>
                            <p className="text-xs text-gray-500">{det.cantidad} unidad(es) x ${Number(det.precio).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="font-black text-gray-900">
                          ${(det.cantidad * det.precio).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total Final */}
                  <div className="mt-6 bg-emerald-50 p-4 rounded-2xl flex justify-between items-center border border-emerald-100">
                    <span className="text-emerald-800 font-bold text-lg">Total Pagado:</span>
                    <span className="text-emerald-700 font-black text-2xl">
                      ${Number(selectedVenta?.total).toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* ¡NUEVA SECCIÓN DE ACCIONES DE COMPARTIR/IMPRIMIR! */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleImprimir}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700 gap-1"
                    >
                      <Printer size={20} className="text-blue-600" />
                      <span className="text-xs font-bold">Imprimir</span>
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:bg-emerald-50 transition-colors text-gray-700 gap-1"
                    >
                      <Share2 size={20} className="text-emerald-600" />
                      <span className="text-xs font-bold">WhatsApp</span>
                    </button>
                    <button
                      onClick={handleCorreo}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:bg-amber-50 transition-colors text-gray-700 gap-1"
                    >
                      <Mail size={20} className="text-amber-600" />
                      <span className="text-xs font-bold">Correo</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
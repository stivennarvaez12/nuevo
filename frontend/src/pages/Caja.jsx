import React, { useState } from 'react';
import { useCaja } from '../contexto/CajaContext';
import axios from 'axios';
// 🔥 REGLA DE ORO: Importamos las notificaciones obligatorias para la interfaz
import { toast } from 'react-hot-toast'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function Caja() {
    const { cajaEstado, cajaInfo, verificarCaja, cargandoCaja } = useCaja();
    const [montoInicial, setMontoInicial] = useState('');
    const [montoReal, setMontoReal] = useState('');

    // ID de usuario estático o extraído de tu localStorage de autenticación
    const id_usuario = localStorage.getItem('id_usuario') || 1; 

    if (cargandoCaja) {
        return <div className="p-6 text-center font-medium text-slate-500">Verificando el estado de la caja...</div>;
    }

    // A. PROCESAR APERTURA DE CAJA
    const handleApertura = async (e) => {
        e.preventDefault();
        
        // Creamos una carga visual inteligente mientras el servidor responde
        const loaddingToast = toast.loading('Abriendo turno de caja...');
        
        try {
            const res = await axios.post(`${API_URL}/api/caja/abrir`, {
                id_usuario,
                monto_inicial: Number(montoInicial)
            });
            
            // 🔥 REGLA DE ORO: Éxito notificado correctamente
            toast.success(res.data.message || '¡Caja abierta con éxito!', { id: loaddingToast });
            setMontoInicial('');
            verificarCaja(); // Actualiza el estado global de la app
        } catch (error) {
            const errorDetalle = error.response?.data?.error || error.response?.data?.message || error.message;
            
            // 🔥 REGLA DE ORO: El error real sale en un toast rojo impecable
            toast.error(`Error al abrir: ${errorDetalle}`, { id: loaddingToast, duration: 6000 });
        }
    };

    // B. PROCESAR CIERRE DE CAJA (ARQUEO)
    const handleCierre = async (e) => {
        e.preventDefault();
        const loaddingToast = toast.loading('Procesando arqueo y cierre...');
        
        try {
            const res = await axios.post(`${API_URL}/api/caja/cerrar`, {
                id_turno: cajaInfo?.id_turno,
                monto_final_real: Number(montoReal)
            });
            
            // 🔥 REGLA DE ORO: Notificamos el cierre exitoso
            toast.success('Turno cerrado y guardado correctamente.', { id: loaddingToast });
            
            // Mostramos un resumen rápido en un toast informativo extendido
            const resumen = res.data.resumen;
            toast(`Resumen: Esperado $${resumen.efectivoEsperado.toLocaleString()} | Real $${resumen.efectivoRealContado.toLocaleString()} | Dif: $${resumen.descuadre.toLocaleString()}`, {
                icon: '📊',
                duration: 8000
            });

            setMontoReal('');
            verificarCaja(); // Pasa el estado global a 'cerrado'
        } catch (error) {
            const errorDetalle = error.response?.data?.error || error.response?.data?.message || error.message;
            
            // 🔥 REGLA DE ORO: Error de cierre en pantalla
            toast.error(`Error al cerrar: ${errorDetalle}`, { id: loaddingToast, duration: 6000 });
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">📦 Control de Apertura y Cierre de Caja</h1>

            {/* VISTA SI LA CAJA ESTÁ CERRADA */}
            {cajaEstado === 'cerrado' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-md">
                    <h2 className="text-lg font-bold text-slate-700 mb-2">🔒 La caja se encuentra Cerrada</h2>
                    <p className="text-sm text-slate-500 mb-4">Para poder registrar ventas, compras o gastos en el sistema, debes iniciar un nuevo turno de caja ingresando el dinero base (efectivo en caja).</p>
                    
                    <form onSubmit={handleApertura} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Monto Inicial (Base de Caja)</label>
                            <input 
                                type="number" 
                                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold"
                                placeholder="Ej: 50000"
                                value={montoInicial}
                                onChange={(e) => setMontoInicial(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-colors">
                            🚀 Abrir Caja e Iniciar Turno
                        </button>
                    </form>
                </div>
            ) : (
                /* VISTA SI LA CAJA ESTÁ ABIERTA */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tarjeta de Estado Actual */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-700">🔓 Turno de Caja Activo</h2>
                            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-semibold animate-pulse">Abierta</span>
                        </div>
                        
                        <div className="space-y-3 text-slate-600 text-sm">
                            <div className="flex justify-between border-b pb-2"><span>Monto Inicial (Base):</span> <span className="font-semibold text-slate-800">${Number(cajaInfo?.monto_inicial).toLocaleString()}</span></div>
                            <div className="flex justify-between border-b pb-2 text-green-600"><span>(+) Ventas del Turno:</span> <span className="font-semibold">${Number(cajaInfo?.monto_ventas).toLocaleString()}</span></div>
                            <div className="flex justify-between border-b pb-2 text-red-500"><span>(-) Compras Realizadas:</span> <span className="font-semibold">${Number(cajaInfo?.monto_compras).toLocaleString()}</span></div>
                            <div className="flex justify-between border-b pb-2 text-red-500"><span>(-) Gastos Registrados:</span> <span className="font-semibold">${Number(cajaInfo?.monto_gastos).toLocaleString()}</span></div>
                            
                            <div className="flex justify-between pt-2 text-base font-bold text-slate-900 bg-slate-50 p-2 rounded">
                                <span>Efectivo Esperado en Caja:</span> 
                                <span>${Number(cajaInfo?.monto_final_esperado).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Cierre / Arqueo */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-700 mb-2">🏁 Arqueo y Cierre de Caja</h2>
                        <p className="text-sm text-slate-500 mb-4">Cuenta detalladamente el dinero físico que tienes en el cajón monedero e ingresa el total exacto aquí:</p>
                        
                        <form onSubmit={handleCierre} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Efectivo Real en Caja</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold"
                                    placeholder="Digita el dinero físico contado"
                                    value={montoReal}
                                    onChange={(e) => setMontoReal(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors">
                                🔒 Realizar Arqueo y Cerrar Turno
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const CajaContext = createContext();

// Usamos tu URL de la API (si no existe la variable de entorno, apunta al localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const CajaProvider = ({ children }) => {
    const [cajaEstado, setCajaEstado] = useState('cerrado'); // Puede ser 'abierto' o 'cerrado'
    const [cajaInfo, setCajaInfo] = useState(null);
    const [cargandoCaja, setCargandoCaja] = useState(true);

    // Función para ir al backend a revisar cómo está la caja
    const verificarCaja = async () => {
        try {
            setCargandoCaja(true);
            const res = await axios.get(`${API_URL}/api/caja/estado`);
            setCajaEstado(res.data.estado);
            setCajaInfo(res.data.info);
        } catch (error) {
            console.error("Error al verificar estado de la caja en el servidor:", error);
        } finally {
            setCargandoCaja(false);
        }
    };

    // Cada vez que se abre la aplicación, revisamos el estado de la caja
    useEffect(() => {
        verificarCaja();
    }, []);

    return (
        <CajaContext.Provider value={{ cajaEstado, cajaInfo, cargandoCaja, verificarCaja }}>
            {children}
        </CajaContext.Provider>
    );
};

// Hook personalizado para usar este contexto de forma fácil en cualquier página
export const useCaja = () => useContext(CajaContext);
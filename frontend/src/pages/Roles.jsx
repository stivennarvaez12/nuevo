import React, { useState, useEffect } from 'react';
import { ShieldCheck, Shield } from 'lucide-react';

const Roles = () => {
    const [roles, setRoles] = useState([]);

    const cargarRoles = async () => {
        try {
            const res = await fetch('http://172.20.10.4:4000/api/roles');
            const data = await res.json();
            setRoles(data);
        } catch (err) {
            console.error("Error al cargar roles:", err);
        }
    };

    useEffect(() => { 
        cargarRoles(); 
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Encabezado */}
                    <div className="p-6 border-b bg-indigo-600 flex items-center gap-3">
                        <ShieldCheck className="text-white" size={28} />
                        <div>
                            <h2 className="text-xl font-bold text-white">Roles y Permisos</h2>
                            <p className="text-indigo-100 text-sm">Niveles de acceso configurados en el sistema</p>
                        </div>
                    </div>

                    {/* Lista de Roles */}
                    <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {roles.map((rol) => (
                                <div key={rol.id_rol} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-300 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-sm">
                                            {rol.id_rol}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-800 text-lg block">{rol.nombre_rol}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Shield size={12} /> Acceso al sistema
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                        Activo
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Roles;
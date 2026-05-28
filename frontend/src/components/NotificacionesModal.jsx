import React from 'react';

export default function NotificacionesModal({ abierto, onClose, notificaciones, limpiarNotificaciones }) {
    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end items-start p-4 sm:p-6">
            {/* Fondo oscuro con blur para cerrar al hacer clic afuera */}
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
                onClick={onClose}
            ></div>

            {/* Contenedor del Modal */}
            <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down">
                {/* Cabecera */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-black text-gray-800 flex items-center gap-2">
                        <span>🔔</span> Notificaciones
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-red-500 font-bold transition p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Lista de Notificaciones */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {notificaciones.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No hay notificaciones nuevas</p>
                    ) : (
                        <ul className="space-y-2">
                            {notificaciones.map((noti) => (
                                <li key={noti.id} className="p-3 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition border border-blue-100/50 flex gap-3 items-start">
                                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        📦
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 font-semibold">{noti.mensaje}</p>
                                        <p className="text-xs text-gray-500 mt-1">{noti.fecha}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pie del Modal */}
                {notificaciones.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <button 
                            onClick={limpiarNotificaciones}
                            className="w-full py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 hover:text-gray-800 transition shadow-sm"
                        >
                            Marcar todas como leídas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
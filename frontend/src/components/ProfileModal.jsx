import { useState, useEffect } from 'react';

export default function ProfileModal({ user, onClose }) {
  const esAdmin = user?.rol_id == 2 || user?.rol === 'admin';
  
  const [historial, setHistorial] = useState([]); 
  const [cargando, setCargando] = useState(false);

  // Efecto para cargar el historial si es un cliente
  useEffect(() => {
    if (!esAdmin && user?.id) {
      const fetchHistorial = async () => {
        setCargando(true);
        try {
          // Ajusta la URL si tu endpoint de ventas no cuelga de /api/admin
          const res = await fetch(`https://supermercado-5759.onrender.com/api/admin/usuario/${user.id}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setHistorial(data);
          }
        } catch (error) {
          console.error("Error cargando el historial:", error);
        } finally {
          setCargando(false);
        }
      };
      fetchHistorial();
    }
  }, [user, esAdmin]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-2xl max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 font-black text-xl transition-colors">✕</button>
        
        <div className="overflow-y-auto pr-2 custom-scrollbar">
          {/* Cabecera del Perfil */}
          <div className="text-center mb-6 mt-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4 shadow-md border-4 border-white ${esAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.nombre || 'Usuario'}</h2>
            <p className="text-gray-500 font-medium mb-3">{user?.correo || 'Sin correo registrado'}</p>
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${esAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {esAdmin ? '⚙️ Administrador' : '👤 Cliente Pro'}
            </span>
          </div>
          
          {/* Estadísticas de la cuenta */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Nivel de cuenta</span>
              <span className={`font-bold ${esAdmin ? 'text-purple-600' : 'text-blue-600'}`}>
                {esAdmin ? 'Administrador' : 'Estándar'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Puntos acumulados</span>
              <span className="font-black text-xl text-yellow-500 flex items-center gap-1">
                ⭐ {user?.puntos || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Estado</span>
              <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-lg text-xs">✅ Activa</span>
            </div>
          </div>

          {/* Sección de Historial de Compras (Solo para clientes) */}
          {!esAdmin && (
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                🛍️ Tus últimas compras
              </h3>
              
              {cargando ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-medium animate-pulse">Cargando tu historial...</p>
                </div>
              ) : historial.length === 0 ? (
                <div className="text-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium mb-1">Aún no tienes compras registradas.</p>
                  <p className="text-sm text-gray-400">¡Anímate a hacer tu primer pedido en la tienda!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historial.map((compra) => (
                    <div key={compra.orden_id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800">Orden #{compra.orden_id}</span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(compra.fecha_venta).toLocaleString('es-CO', { 
                            day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                          {compra.cantidad_productos || 0} items
                        </span>
                        <span className="font-black text-green-600">
                          ${Number(compra.total).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
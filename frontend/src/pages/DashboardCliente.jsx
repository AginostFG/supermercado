import { useEffect, useState } from 'react';

const API = 'https://supermercado-5759.onrender.com';

export default function DashboardCliente({ onAddToCart }) {
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      setUsuario(JSON.parse(sesion));
    }
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const response = await fetch(`${API}/api/productos`);
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          {/* Si hay usuario muestra el nombre, si no, dice Invitado */}
          <h2 className="text-2xl font-bold text-gray-800">
            Hola, {usuario ? usuario.nombre : 'Invitado'} 👋
          </h2>
          <p className="text-gray-500">Bienvenido a tu supermercado de confianza.</p>
        </div>
        {/* Eliminamos el botón de Cerrar Sesión de aquí */}
      </div>

      {cargando ? (
        <p className="text-center text-gray-500">Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productos.map(producto => (
            <div key={producto.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              
              {/* IMAGEN DINÁMICA DEL PRODUCTO */}
              <img 
                src={producto.imagen_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'} 
                alt={producto.nombre} 
                className="w-full h-44 object-cover rounded-xl mb-4 bg-gray-100"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                }}
              />

              <h3 className="font-bold text-lg mb-1">{producto.nombre}</h3>
              <p className={`text-sm mb-4 ${producto.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                Stock disponible: {producto.stock}
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-green-600 font-black text-xl">
                  {/* AQUÍ APLICAMOS EL FORMATO DE MILES/MILLONES */}
                  ${Number(producto.precio).toLocaleString('es-CO')}
                </span>
                
                <button 
                  onClick={() => onAddToCart(producto)}
                  disabled={producto.stock <= 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition active:scale-95 ${
                    producto.stock <= 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {producto.stock <= 0 ? 'Agotado' : 'Agregar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {productos.length === 0 && !cargando && (
        <div className="text-center p-10 bg-gray-100 rounded-xl">
          <p className="text-gray-500">No hay productos disponibles.</p>
        </div>
      )}
    </div>
  );
}
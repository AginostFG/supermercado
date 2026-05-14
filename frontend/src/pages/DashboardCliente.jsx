import { useEffect, useState } from 'react';

const API = 'https://supermercado-5759.onrender.com';

export default function DashboardCliente({ onAddToCart, onLogout }) {
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

  if (!usuario) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hola, {usuario.nombre} 👋</h2>
          <p className="text-gray-500">Bienvenido a tu supermercado de confianza.</p>
        </div>
        <button 
          onClick={onLogout}
          className="text-red-500 hover:text-red-700 font-semibold text-sm"
        >
          Cerrar Sesión
        </button>
      </div>

      {cargando ? (
        <p className="text-center text-gray-500">Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productos.map(producto => (
            <div key={producto.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-lg mb-1">{producto.nombre}</h3>
              <p className={`text-sm mb-4 ${producto.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                Stock disponible: {producto.stock}
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-green-600 font-black text-xl">
                  ${Number(producto.precio).toFixed(2)}
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
import { useEffect, useState } from 'react';

const API = 'https://supermercado-5759.onrender.com';

export default function DashboardCliente({ onAddToCart }) {
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // ✅ Nuevos estados para filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('');

  useEffect(() => {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      setUsuario(JSON.parse(sesion));
    }
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      // Obtenemos productos y categorías al mismo tiempo desde el backend
      const [resProductos, resCategorias] = await Promise.all([
        fetch(`${API}/api/productos`),
        fetch(`${API}/api/admin/categorias`)
      ]);
      
      const dataProductos = await resProductos.json();
      const dataCategorias = await resCategorias.json();
      
      setProductos(Array.isArray(dataProductos) ? dataProductos : []);
      setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setCargando(false);
    }
  };

  // ✅ Lógica para filtrar productos en tiempo real
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === '' || producto.categoria_id === parseInt(categoriaActiva);
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Hola, {usuario ? usuario.nombre : 'Invitado'} 👋
          </h2>
          <p className="text-gray-500">¿Qué vas a llevar hoy?</p>
        </div>

        {/* ✅ BARRA DE BÚSQUEDA */}
        <div className="w-full md:w-1/3 relative">
          <input 
            type="text" 
            placeholder="🔍 Buscar productos..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-50"
          />
        </div>
      </div>

      {/* ✅ BOTONES DE CATEGORÍAS */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setCategoriaActiva('')}
          className={`whitespace-nowrap px-5 py-2 rounded-xl font-bold transition-colors ${
            categoriaActiva === '' 
            ? 'bg-green-600 text-white shadow-md' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          🌟 Todos
        </button>
        {categorias.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`whitespace-nowrap px-5 py-2 rounded-xl font-bold transition-colors ${
              categoriaActiva === cat.id 
              ? 'bg-green-600 text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="text-center py-10"><span className="text-xl text-gray-500">Cargando catálogo... ⏳</span></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition">
              <div 
                className="w-full h-40 bg-gray-100 rounded-xl mb-4 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${producto.imagen_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'})`
                }}
              />

              <h3 className="font-bold text-lg mb-1 text-gray-800">{producto.nombre}</h3>
              <p className={`text-sm mb-4 ${producto.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                Stock disponible: {producto.stock}
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-green-600 font-black text-xl">
                  ${Number(producto.precio).toLocaleString('es-CO')}
                </span>
                
                <button 
                  onClick={() => onAddToCart(producto)}
                  disabled={producto.stock <= 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition active:scale-95 ${
                    producto.stock <= 0 
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
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

      {/* ✅ MENSAJE SI NO HAY RESULTADOS */}
      {productosFiltrados.length === 0 && !cargando && (
        <div className="text-center p-10 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-gray-500 font-medium">No encontramos productos con esos filtros.</p>
        </div>
      )}
    </div>
  );
}
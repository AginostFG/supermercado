import { useEffect, useState } from 'react';

const API = 'https://supermercado-5759.onrender.com';

export default function DashboardCliente({ onAddToCart }) {
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // ✅ Estados para filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('');
  
  // ✅ NUEVOS estados para filtros avanzados
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [orden, setOrden] = useState(''); // 'precio_asc', 'precio_desc', 'az', 'za'

  useEffect(() => {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      setUsuario(JSON.parse(sesion));
    }
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
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

  // ✅ Lógica MEJORADA para filtrar y ordenar productos en tiempo real
  let productosFiltrados = productos.filter(producto => {
    // Filtro por texto
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    // Filtro por categoría
    const coincideCategoria = categoriaActiva === '' || producto.categoria_id === parseInt(categoriaActiva);
    // Filtros por precio
    const precio = Number(producto.precio);
    const coincidePrecioMin = precioMin === '' || precio >= Number(precioMin);
    const coincidePrecioMax = precioMax === '' || precio <= Number(precioMax);
    
    return coincideBusqueda && coincideCategoria && coincidePrecioMin && coincidePrecioMax;
  });

  // ✅ Lógica para ordenar el array resultante
  if (orden === 'precio_asc') {
    productosFiltrados.sort((a, b) => Number(a.precio) - Number(b.precio));
  } else if (orden === 'precio_desc') {
    productosFiltrados.sort((a, b) => Number(b.precio) - Number(a.precio));
  } else if (orden === 'az') {
    productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (orden === 'za') {
    productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
  }

  // Función para limpiar filtros avanzados
  const limpiarFiltros = () => {
    setPrecioMin('');
    setPrecioMax('');
    setOrden('');
    setBusqueda('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE BIENVENIDA Y BÚSQUEDA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Hola, {usuario ? usuario.nombre : 'Invitado'} 👋
          </h2>
          <p className="text-gray-500">¿Qué vas a llevar hoy?</p>
        </div>

        <div className="w-full md:w-1/3 relative">
          <input 
            type="text" 
            placeholder="🔍 Buscar productos..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-50 transition"
          />
        </div>
      </div>

      {/* BOTONES DE CATEGORÍAS */}
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

      {/* ✅ NUEVA BARRA DE FILTROS AVANZADOS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium text-sm">💰 Precio:</span>
            <input 
              type="number" 
              placeholder="Min" 
              value={precioMin} 
              onChange={e => setPrecioMin(e.target.value)} 
              className="w-24 p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:outline-none" 
            />
            <span className="text-gray-400">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={precioMax} 
              onChange={e => setPrecioMax(e.target.value)} 
              className="w-24 p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 focus:outline-none" 
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium text-sm">🔃 Ordenar por:</span>
            <select 
              value={orden} 
              onChange={e => setOrden(e.target.value)} 
              className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-green-500 focus:outline-none cursor-pointer"
            >
              <option value="">Relevancia</option>
              <option value="precio_asc">Menor a mayor precio</option>
              <option value="precio_desc">Mayor a menor precio</option>
              <option value="az">Nombre (A - Z)</option>
              <option value="za">Nombre (Z - A)</option>
            </select>
          </div>
        </div>

        {(precioMin || precioMax || orden || busqueda) && (
          <button 
            onClick={limpiarFiltros} 
            className="text-sm text-red-500 font-bold hover:text-red-700 hover:underline transition"
          >
            ❌ Limpiar filtros
          </button>
        )}
      </div>

      {/* GRID DE PRODUCTOS */}
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

      {/* MENSAJE SI NO HAY RESULTADOS */}
      {productosFiltrados.length === 0 && !cargando && (
        <div className="text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <span className="text-5xl mb-3 block">😕</span>
          <p className="text-gray-800 font-bold text-lg">No encontramos productos con esos filtros.</p>
          <p className="text-gray-500">Intenta ampliando el rango de precio o cambiando la categoría.</p>
          <button 
            onClick={limpiarFiltros}
            className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
}
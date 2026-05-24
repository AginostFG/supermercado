import { useState, useEffect } from 'react';

const API = 'https://supermercado-5759.onrender.com';
const HEADERS = { 'Content-Type': 'application/json', 'x-rol': '2' };

export default function DashboardAdmin() {
    const [seccion, setSeccion] = useState('usuarios');
    const [data, setData] = useState([]);
    const [listaCategorias, setListaCategorias] = useState([]); // ✅ Estado para las categorías del select
    const [modal, setModal] = useState({ abierto: false, tipo: 'crear', item: null });

    const cargarDatos = async () => {
        let url = '/api/admin/usuarios';
        if (seccion === 'inventario') url = '/api/productos';
        if (seccion === 'categorias') url = '/api/admin/categorias';
        if (seccion === 'ventas') url = '/api/admin/ventas-hoy';

        try {
            const res = await fetch(`${API}${url}`, { headers: HEADERS });
            const result = await res.json();
            setData(Array.isArray(result) ? result : []);
        } catch (error) { setData([]); }

        // Si estamos en inventario, cargamos las categorías disponibles para el formulario
        if (seccion === 'inventario') {
            try {
                const resCat = await fetch(`${API}/api/admin/categorias`, { headers: HEADERS });
                const resultCat = await resCat.json();
                setListaCategorias(Array.isArray(resultCat) ? resultCat : []);
            } catch (error) { setListaCategorias([]); }
        }
    };

    useEffect(() => { cargarDatos(); }, [seccion]);

    const handleEliminar = async (id, nombre) => {
        const confirmar = confirm(`¿Estás seguro de que deseas eliminar "${nombre}"?`);
        if (!confirmar) return;
        
        let ruta = 'usuarios';
        if (seccion === 'inventario') ruta = 'productos';
        if (seccion === 'categorias') ruta = 'categorias';

        await fetch(`${API}/api/admin/${ruta}/${id}`, { method: 'DELETE', headers: HEADERS });
        cargarDatos();
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const itemData = Object.fromEntries(formData.entries());

        let url = '';
        let metodo = modal.tipo === 'editar' ? 'PUT' : 'POST';

        if (seccion === 'categorias') {
            url = modal.tipo === 'editar' ? `${API}/api/admin/categorias/${modal.item.id}` : `${API}/api/admin/categorias`;
        } else {
            if (itemData.stock !== undefined) {
                itemData.stock = parseInt(itemData.stock);
                if (itemData.stock < 0) return alert("El stock no puede ser negativo.");
            }
            if (itemData.precio !== undefined) {
                itemData.precio = parseFloat(itemData.precio);
                if (itemData.precio < 0) return alert("El precio no puede ser negativo.");
            }
            if (itemData.categoria_id !== undefined) {
                itemData.categoria_id = parseInt(itemData.categoria_id);
            }

            url = modal.tipo === 'editar'
                ? `${API}/api/admin/${seccion === 'usuarios' ? 'usuarios' : 'productos'}/${modal.item.id}`
                : `${API}/api/admin/productos`;
        }

        const res = await fetch(url, {
            method: metodo,
            headers: HEADERS,
            body: JSON.stringify(itemData)
        });

        if (res.ok) {
            setModal({ abierto: false, tipo: 'crear', item: null });
            cargarDatos();
        } else {
            const err = await res.json();
            alert(`Error al guardar: ${err.error || 'Intenta de nuevo.'}`);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="bg-slate-800 text-white p-8 rounded-2xl">
                <h2 className="text-3xl font-bold">Administración ⚙️</h2>
            </div>

            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border w-fit">
                {['usuarios', 'inventario', 'categorias', 'ventas'].map(s => (
                    <button key={s} onClick={() => setSeccion(s)}
                        className={`px-6 py-2 rounded-xl font-bold capitalize ${seccion === s ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold uppercase">{seccion}</h3>
                    {seccion === 'inventario' && (
                        <button onClick={() => setModal({ abierto: true, tipo: 'crear', item: null })} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">+ Nuevo Producto</button>
                    )}
                    {seccion === 'categorias' && (
                        <button onClick={() => setModal({ abierto: true, tipo: 'crear', item: null })} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">+ Nueva Categoría</button>
                    )}
                </div>

                <table className="w-full text-left">
                    <thead className="text-gray-400 text-xs border-b">
                        <tr>
                            <th className="p-4">{seccion === 'categorias' ? 'ID' : 'Nombre'}</th>
                            <th className="p-4">{seccion === 'categorias' ? 'Nombre Categoría' : 'Info'}</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td colSpan="3" className="text-center p-6 text-gray-400">No hay datos disponibles</td></tr>
                        ) : data.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold">
                                    {seccion === 'categorias' ? `#${item.id}` : (
                                        <>
                                            {seccion === 'inventario' && item.imagen_url && (
                                                <img src={item.imagen_url} alt="img" className="w-8 h-8 rounded-full inline-block mr-2 object-cover bg-gray-200" />
                                            )}
                                            {item.nombre} {item.apellidos || ""}
                                        </>
                                    )}
                                </td>
                                <td className="p-4 text-gray-600">
                                    {seccion === 'usuarios' ? item.correo
                                        : seccion === 'inventario' ? `$${Number(item.precio).toLocaleString('es-CO')} | Stock: ${item.stock}`
                                        : seccion === 'categorias' ? item.nombre
                                        : `$${item.total}`}
                                </td>
                                <td className="p-4 text-right">
                                    {seccion !== 'ventas' && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setModal({ abierto: true, tipo: 'editar', item })} className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-lg text-sm font-semibold">✏️ Editar</button>
                                            <button onClick={() => handleEliminar(item.id, item.nombre)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-semibold">🗑️ Eliminar</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal.abierto && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl">
                        <div className="bg-green-600 p-6 text-white font-bold text-center text-xl">
                            {modal.tipo === 'editar' ? '✏️ Editar' : '➕ Nuevo Registro'}
                        </div>
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            
                            {seccion === 'categorias' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre de la Categoría</label>
                                    <input name="nombre" defaultValue={modal.item?.nombre} placeholder="Ej. Frutas y Verduras" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                </div>
                            )}

                            {seccion === 'inventario' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre del Producto</label>
                                        <input name="nombre" defaultValue={modal.item?.nombre} placeholder="Ej. Manzana" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                                            <input name="stock" type="number" min="0" defaultValue={modal.item?.stock} placeholder="0" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Precio</label>
                                            <input name="precio" type="number" min="0" step="0.01" defaultValue={modal.item?.precio} placeholder="0.00" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Categoría</label>
                                        {/* ✅ SELECT DINÁMICO DE CATEGORÍAS */}
                                        <select name="categoria_id" defaultValue={modal.item?.categoria_id || ''} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none bg-white" required>
                                            <option value="" disabled>Seleccione una categoría</option>
                                            {listaCategorias.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">URL de la Imagen</label>
                                        <input name="imagen_url" type="url" defaultValue={modal.item?.imagen_url} placeholder="https://ejemplo.com/imagen.jpg" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                    </div>
                                </div>
                            )}

                            {seccion === 'usuarios' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 mb-1 block">Nombre (Fijo)</label>
                                            <input type="text" defaultValue={modal.item?.nombre} disabled className="w-full p-3 border bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 mb-1 block">Apellidos (Fijo)</label>
                                            <input type="text" defaultValue={modal.item?.apellidos} disabled className="w-full p-3 border bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed focus:outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Correo Electrónico</label>
                                        <input name="correo" type="email" defaultValue={modal.item?.correo} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</label>
                                        <input name="telefono" type="text" defaultValue={modal.item?.telefono} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Puntos Acumulados</label>
                                        <input name="puntos" type="number" min="0" defaultValue={modal.item?.puntos} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Guardar</button>
                                <button type="button" onClick={() => setModal({ abierto: false, tipo: 'crear', item: null })} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
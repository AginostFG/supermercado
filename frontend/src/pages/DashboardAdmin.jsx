import { useState, useEffect } from 'react';

const API = 'https://supermercado-5759.onrender.com';
const HEADERS = { 'Content-Type': 'application/json', 'x-rol': '2' };

export default function DashboardAdmin() {
    const [seccion, setSeccion] = useState('usuarios');
    const [data, setData] = useState([]);
    const [modal, setModal] = useState({ abierto: false, tipo: 'crear', item: null });

    const cargarDatos = async () => {
        let url = seccion === 'usuarios' ? '/api/admin/usuarios' : seccion === 'inventario' ? '/api/productos' : '/api/admin/ventas-hoy';
        try {
            const res = await fetch(`${API}${url}`, { headers: HEADERS });
            const result = await res.json();
            setData(Array.isArray(result) ? result : []);
        } catch (error) { setData([]); }
    };

    useEffect(() => { cargarDatos(); }, [seccion]);

    const handleEliminar = async (id, nombre) => {
        const confirmar = confirm(`¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`);
        if (!confirmar) return;
        const ruta = seccion === 'usuarios' ? 'usuarios' : 'productos';
        await fetch(`${API}/api/admin/${ruta}/${id}`, { method: 'DELETE', headers: HEADERS });
        cargarDatos();
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const itemData = Object.fromEntries(formData.entries());

        // Validar valores negativos
        if (itemData.stock !== undefined && Number(itemData.stock) < 0)
            return alert("El stock no puede ser negativo.");
        if (itemData.precio !== undefined && Number(itemData.precio) < 0)
            return alert("El precio no puede ser negativo.");

        const esEditar = modal.tipo === 'editar';
        const url = esEditar
            ? `${API}/api/admin/${seccion === 'usuarios' ? 'usuarios' : 'productos'}/${modal.item.id}`
            : `${API}/api/admin/productos`;

        const res = await fetch(url, {
            method: esEditar ? 'PUT' : 'POST',
            headers: HEADERS,
            body: JSON.stringify(itemData)
        });

        if (res.ok) {
            setModal({ abierto: false, tipo: 'crear', item: null });
            cargarDatos();
        } else {
            alert("Error al guardar. Intenta de nuevo.");
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="bg-slate-800 text-white p-8 rounded-2xl">
                <h2 className="text-3xl font-bold">Administración ⚙️</h2>
            </div>

            <div className="flex gap-4 bg-white p-2 rounded-2xl shadow-sm border w-fit">
                {['usuarios', 'inventario', 'ventas'].map(s => (
                    <button key={s} onClick={() => setSeccion(s)}
                        className={`px-6 py-2 rounded-xl font-bold capitalize ${seccion === s ? 'bg-green-600 text-white' : 'text-gray-500'}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold uppercase">{seccion}</h3>
                    {seccion === 'inventario' && (
                        <button onClick={() => setModal({ abierto: true, tipo: 'crear', item: null })}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
                            + Nuevo Producto
                        </button>
                    )}
                </div>

                <table className="w-full text-left">
                    <thead className="text-gray-400 text-xs border-b">
                        <tr>
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Info</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td colSpan="3" className="text-center p-6 text-gray-400">No hay datos disponibles</td></tr>
                        ) : data.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold">{item.nombre} {item.apellidos || ""}</td>
                                <td className="p-4 text-gray-600">
                                    {seccion === 'usuarios' ? item.correo
                                        : seccion === 'inventario' ? `$${Number(item.precio).toFixed(2)} | Stock: ${item.stock}`
                                        : `$${item.total}`}
                                </td>
                                <td className="p-4 text-right">
                                    {seccion !== 'ventas' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setModal({ abierto: true, tipo: 'editar', item })}
                                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-lg text-sm font-semibold">
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(item.id, item.nombre)}
                                                className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-semibold">
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal.abierto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl">
                        <div className="bg-green-600 p-6 text-white font-bold text-center text-xl">
                            {modal.tipo === 'editar' ? '✏️ Editar' : '➕ Nuevo Producto'}
                        </div>
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre</label>
                                <input name="nombre" defaultValue={modal.item?.nombre} placeholder="Nombre del producto"
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                            </div>
                            {seccion === 'inventario' ? (
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                                        <input name="stock" type="number" min="0" defaultValue={modal.item?.stock}
                                            placeholder="0" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Precio</label>
                                        <input name="precio" type="number" min="0" step="0.01" defaultValue={modal.item?.precio}
                                            placeholder="0.00" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Puntos</label>
                                    <input name="puntos" type="number" min="0" defaultValue={modal.item?.puntos}
                                        placeholder="0" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
                                    Guardar
                                </button>
                                <button type="button" onClick={() => setModal({ abierto: false, tipo: 'crear', item: null })}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
import { useState, useEffect } from 'react';

const API = 'https://supermercado-5759.onrender.com';

export default function DashboardAdmin() {
    const [seccion, setSeccion] = useState('usuarios');
    const [data, setData] = useState([]);
    const [modal, setModal] = useState({ abierto: false, tipo: 'crear', item: null });

    const cargarDatos = async () => {
        let url = seccion === 'usuarios' ? '/api/admin/usuarios' : seccion === 'inventario' ? '/api/productos' : '/api/admin/ventas-hoy';
        try {
            const res = await fetch(`${API}${url}`);
            const result = await res.json();
            setData(Array.isArray(result) ? result : []);
        } catch (error) { setData([]); }
    };

    useEffect(() => { cargarDatos(); }, [seccion]);

    const handleEliminar = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este registro?")) return;
        const ruta = seccion === 'usuarios' ? 'usuarios' : 'productos';
        await fetch(`${API}/api/admin/${ruta}/${id}`, { method: 'DELETE' });
        cargarDatos();
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const itemData = Object.fromEntries(formData.entries());
        
        const esEditar = modal.tipo === 'editar';
        const url = esEditar 
            ? `${API}/api/admin/${seccion === 'usuarios' ? 'usuarios' : 'productos'}/${modal.item.id}`
            : `${API}/api/admin/productos`;

        await fetch(url, {
            method: esEditar ? 'PUT' : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(itemData)
        });
        
        setModal({ abierto: false, tipo: 'crear', item: null });
        cargarDatos();
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="bg-slate-800 text-white p-8 rounded-2xl">
                <h2 className="text-3xl font-bold">Administración ⚙️</h2>
            </div>

            <div className="flex gap-4 bg-white p-2 rounded-2xl shadow-sm border w-fit">
                {['usuarios', 'inventario', 'ventas'].map(s => (
                    <button key={s} onClick={() => setSeccion(s)} className={`px-6 py-2 rounded-xl font-bold capitalize ${seccion === s ? 'bg-green-600 text-white' : 'text-gray-500'}`}>{s}</button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold uppercase">{seccion}</h3>
                    {seccion === 'inventario' && (
                        <button onClick={() => setModal({ abierto: true, tipo: 'crear', item: null })} className="bg-green-600 text-white px-4 py-2 rounded-lg">+ Nuevo</button>
                    )}
                </div>

                <table className="w-full text-left">
                    <thead className="text-gray-400 text-xs border-b">
                        <tr><th className="p-4">Detalle</th><th className="p-4">Info</th><th className="p-4 text-right">Acciones</th></tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold">{item.nombre} {item.apellidos || ""}</td>
                                <td className="p-4">
                                    {seccion === 'usuarios' ? item.correo : seccion === 'inventario' ? `$${item.precio} (Stock: ${item.stock})` : `$${item.total}`}
                                </td>
                                <td className="p-4 text-right">
                                    {seccion !== 'ventas' && (
                                        <>
                                            <button onClick={() => setModal({ abierto: true, tipo: 'editar', item })} className="text-blue-500 mr-3">✏️</button>
                                            <button onClick={() => handleEliminar(item.id)} className="text-red-500">🗑️</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal.abierto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
                        <div className="bg-green-600 p-6 text-white font-bold text-center text-xl">
                            {modal.tipo === 'editar' ? 'Editar' : 'Nuevo'}
                        </div>
                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            <input name="nombre" defaultValue={modal.item?.nombre} placeholder="Nombre" className="w-full p-3 border rounded-xl" required />
                            {seccion === 'inventario' ? (
                                <div className="flex gap-4">
                                    <input name="stock" type="number" defaultValue={modal.item?.stock} placeholder="Stock" className="w-full p-3 border rounded-xl" required />
                                    <input name="precio" type="number" step="0.01" defaultValue={modal.item?.precio} placeholder="Precio" className="w-full p-3 border rounded-xl" required />
                                </div>
                            ) : (
                                <input name="puntos" type="number" defaultValue={modal.item?.puntos} placeholder="Puntos" className="w-full p-3 border rounded-xl" required />
                            )}
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                                <button type="button" onClick={() => setModal({ abierto: false })} className="flex-1 bg-gray-200 py-3 rounded-xl">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
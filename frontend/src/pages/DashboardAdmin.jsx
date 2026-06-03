import { useState, useEffect, useRef } from 'react';
import NotificacionesModal from '../components/NotificacionesModal';
import RegisterModal from '../components/RegisterModal'; 

const API = 'https://supermercado-5759.onrender.com';
const HEADERS = { 'Content-Type': 'application/json', 'x-rol': '2' };

export default function DashboardAdmin() {
    const [seccion, setSeccion] = useState('usuarios');
    const [periodoVentas, setPeriodoVentas] = useState('diario');
    const [data, setData] = useState([]);
    const [listaCategorias, setListaCategorias] = useState([]); 
    const [modal, setModal] = useState({ abierto: false, tipo: 'crear', item: null });
    const [isRegisterOpen, setIsRegisterOpen] = useState(false); 
    
    const [alertaNuevaOrden, setAlertaNuevaOrden] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]); 
    const [modalNotiAbierto, setModalNotiAbierto] = useState(false);
    const ultimoIdVentaRef = useRef(null);

    const cargarDatos = async (esPolling = false) => {
        let url = '/api/admin/usuarios';
        if (seccion === 'inventario') url = '/api/productos';
        if (seccion === 'categorias') url = '/api/admin/categorias';
        if (seccion === 'ventas') url = `/api/admin/ventas?periodo=${periodoVentas}`;

        try {
            const res = await fetch(`${API}${url}`, { headers: HEADERS });
            const result = await res.json();
            const newData = Array.isArray(result) ? result : [];
            
            if (seccion === 'ventas' && newData.length > 0) {
                const maxId = Math.max(...newData.map(v => v.id));
                
                if (ultimoIdVentaRef.current !== null && maxId > ultimoIdVentaRef.current) {
                    const nuevasOrdenes = newData.filter(v => v.id > ultimoIdVentaRef.current);
                    
                    const nuevasNotificaciones = nuevasOrdenes.map(orden => ({
                        id: orden.id + '-' + Date.now(),
                        mensaje: `¡Nueva orden #${orden.id} recibida de ${orden.cliente_nombre || 'un cliente'}!`,
                        fecha: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                    }));

                    setNotificaciones(prev => [...nuevasNotificaciones, ...prev]);
                    setAlertaNuevaOrden(true);
                    setTimeout(() => setAlertaNuevaOrden(false), 8000); 
                }
                ultimoIdVentaRef.current = maxId;
            }

            setData(newData);
        } catch (error) { 
            if (!esPolling) setData([]); 
        }

        if (seccion === 'inventario' && !esPolling) {
            try {
                const resCat = await fetch(`${API}/api/admin/categorias`, { headers: HEADERS });
                const resultCat = await resCat.json();
                setListaCategorias(Array.isArray(resultCat) ? resultCat : []);
            } catch (error) { setListaCategorias([]); }
        }
    };

    useEffect(() => { 
        cargarDatos(); 
    }, [seccion, periodoVentas]);

    useEffect(() => {
        let intervalo;
        if (seccion === 'ventas') {
            intervalo = setInterval(() => {
                cargarDatos(true);
            }, 15000);
        }
        return () => clearInterval(intervalo);
    }, [seccion, periodoVentas]);

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

    const calcularStatsVentas = () => {
        if (seccion !== 'ventas') return { ingresos: 0, ordenes: 0, items: 0 };
        return {
            ingresos: data.reduce((sum, v) => sum + (Number(v.total) || 0), 0),
            ordenes: data.length,
            items: data.reduce((sum, v) => sum + (Number(v.cantidad_total) || 0), 0)
        };
    };

    const obtenerProductosDeOrden = (item) => {
        if (!item) return [];
        const origen = item.productos || item.detalles || item.items;
        if (!origen) return [];
        if (Array.isArray(origen)) return origen;
        if (typeof origen === 'string') {
            try {
                return JSON.parse(origen);
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const stats = calcularStatsVentas();
    const productosOrden = obtenerProductosDeOrden(modal.item);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 md:p-6 relative">
            
            {/* Modal de Notificaciones */}
            <NotificacionesModal 
                abierto={modalNotiAbierto} 
                onClose={() => setModalNotiAbierto(false)} 
                notificaciones={notificaciones}
                limpiarNotificaciones={() => {
                    setNotificaciones([]);
                    setModalNotiAbierto(false);
                }}
            />

            {/* MENÚ LATERAL ADMIN */}
            <div className="md:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 h-fit">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Panel Admin</h2>
                {['usuarios', 'inventario', 'categorias', 'ventas'].map(s => (
                    <button key={s} onClick={() => setSeccion(s)} className={`w-full text-left px-4 py-3 rounded-xl font-semibold capitalize transition ${seccion === s ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {s === 'usuarios' ? '👥' : s === 'inventario' ? '📦' : s === 'categorias' ? '🏷️' : '📊'} {s}
                    </button>
                ))}
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="md:col-span-3 space-y-6">
                
                {/* BANNER DE ALERTA NUEVO PEDIDO */}
                {alertaNuevaOrden && seccion === 'ventas' && (
                    <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔔</span>
                            <div>
                                <p className="font-bold">¡Nueva orden recibida!</p>
                                <p className="text-sm text-blue-100">La lista se ha actualizado automáticamente.</p>
                            </div>
                        </div>
                        <button onClick={() => setAlertaNuevaOrden(false)} className="text-white hover:text-blue-200 font-bold">X</button>
                    </div>
                )}

                {/* ÚNICA CABECERA CORRECTA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                    
                    {/* BLOQUE IZQUIERDO: Título, Subtítulo y Botón de añadir nuevo abajo */}
                    <div className="space-y-3 w-full sm:w-auto">
                        <div>
                            <h1 className="text-2xl font-black text-gray-800 capitalize">Gestión de {seccion}</h1>
                            <p className="text-gray-500 text-sm">Administra tu plataforma en tiempo real.</p>
                        </div>
                        
                        {/* Botón "+ Añadir Nuevo" ubicado en el bloque izquierdo */}
                        {seccion !== 'ventas' && (
                            <button 
                                onClick={() => {
                                    if (seccion === 'usuarios') {
                                        setIsRegisterOpen(true); 
                                    } else {
                                        setModal({ abierto: true, tipo: 'crear', item: null }); 
                                    }
                                }} 
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 text-sm"
                            >
                                + Añadir Nuevo
                            </button>
                        )}
                    </div>
                    
                    {/* BLOQUE DER: Contenedor unificado para utilerías en la esquina superior derecha */}
                
                </div>

                {/* TARJETAS DE ESTADÍSTICAS Y FILTROS (Solo en Ventas) */}
                {seccion === 'ventas' && (
                    <div className="space-y-6">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex gap-1 overflow-x-auto">
                            {['diario', 'semanal', 'mensual', 'anual'].map((periodo) => (
                                <button
                                    key={periodo}
                                    onClick={() => setPeriodoVentas(periodo)}
                                    className={`px-5 py-2.5 rounded-lg font-bold text-sm capitalize transition whitespace-nowrap ${periodoVentas === periodo ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {periodo === 'diario' ? '📅 Hoy' : periodo === 'semanal' ? '🗓️ Semana' : periodo === 'mensual' ? '📊 Mes' : '👑 Año'}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-sm font-semibold mb-1">Ingresos Totales</p>
                                <h3 className="text-2xl font-black text-green-600">${stats.ingresos.toLocaleString('es-CO')}</h3>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-sm font-semibold mb-1">Órdenes Realizadas</p>
                                <h3 className="text-2xl font-black text-blue-600">{stats.ordenes} pedidos</h3>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-sm font-semibold mb-1">Productos Vendidos</p>
                                <h3 className="text-2xl font-black text-purple-600">{stats.items} unidades</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLA DE DATOS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pl-6">{seccion === 'categorias' ? 'ID' : 'Nombre'}</th>
                                    <th className="p-4">{seccion === 'categorias' ? 'Categoría' : 'Info'}</th>
                                    <th className="p-4 pr-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700 divide-y divide-gray-50">
                                {data.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center p-8 text-gray-400">No hay datos disponibles en esta sección.</td></tr>
                                ) : data.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50/50">
                                        <td className="p-4 pl-6 font-bold">
                                            {seccion === 'categorias' ? `#${item.id}` : seccion === 'ventas' ? `Orden #${item.id || index + 100}` : (
                                                <div className="flex items-center gap-3">
                                                    {seccion === 'inventario' && item.imagen_url && (
                                                        <img src={item.imagen_url} alt="img" className="w-10 h-10 rounded-xl object-cover bg-gray-100" />
                                                    )}
                                                    <span>{item.nombre || item.cliente_nombre} {item.apellidos || ""}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600 font-medium">
                                            {seccion === 'usuarios' ? item.correo
                                                : seccion === 'inventario' ? `$${Number(item.precio).toLocaleString('es-CO')} | Stock: ${item.stock}`
                                                : seccion === 'categorias' ? item.nombre
                                                : `$${Number(item.total || 0).toLocaleString('es-CO')}`}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {seccion !== 'ventas' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setModal({ abierto: true, tipo: 'editar', item })} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">Editar</button>
                                                    <button onClick={() => handleEliminar(item.id, item.nombre)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">Eliminar</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setModal({ abierto: true, tipo: 'detalle_venta', item })} className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                                        Ver Detalles
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* RENDERIZADO DEL REGISTERMODAL PARA REGISTRO DE NUEVO USUARIO */}
            {isRegisterOpen && (
                <RegisterModal 
                    onClose={() => {
                        setIsRegisterOpen(false);
                        cargarDatos(); 
                    }} 
                />
            )}

            {/* MODAL PARA EDICIÓN Y DETALLES */}
            {modal.abierto && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className={`p-6 text-white font-bold text-center text-xl ${modal.tipo === 'detalle_venta' ? 'bg-purple-600' : 'bg-green-600'}`}>
                            {modal.tipo === 'editar' ? '✏️ Editar Registro' : modal.tipo === 'detalle_venta' ? '🧾 Ticket de Venta' : '➕ Nuevo Registro'}
                        </div>
                        
                        {modal.tipo === 'detalle_venta' ? (
                            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm text-gray-700">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Número de Orden:</span>
                                    <span className="font-bold">#{modal.item?.id}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Cliente:</span>
                                    <span className="font-bold text-right">{modal.item?.cliente_nombre}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Fecha de Compra:</span>
                                    <span className="font-bold text-right">{new Date(modal.item?.fecha).toLocaleString('es-CO')}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Dirección de Entrega:</span>
                                    <span className="font-bold text-right">{modal.item?.direccion || 'Recogida en tienda'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Método de Pago:</span>
                                    <span className="font-bold capitalize">{modal.item?.metodo_pago || 'No especificado'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Total de Artículos:</span>
                                    <span className="font-bold">{modal.item?.cantidad_total || 0} unidades</span>
                                </div>
                                
                                <div className="border-t border-b border-gray-100 py-3 my-2">
                                    <p className="font-bold text-gray-400 uppercase text-[11px] tracking-wider mb-2">Artículos Solicitados</p>
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                        {productosOrden.length > 0 ? (
                                            productosOrden.map((prod, pIdx) => (
                                                <div key={pIdx} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{prod.nombre || prod.nombre_producto || 'Producto'}</p>
                                                        <p className="text-gray-400">{prod.cantidad} x ${Number(prod.precio_unitario || prod.precio || 0).toLocaleString('es-CO')}</p>
                                                    </div>
                                                    <span className="font-bold text-gray-700">
                                                        ${(Number(prod.cantidad || 0) * Number(prod.precio_unitario || prod.precio || 0)).toLocaleString('es-CO')}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-xs italic text-center py-2">No hay desglose de productos disponible.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between bg-green-50 p-4 rounded-xl mt-4 items-center">
                                    <span className="text-green-800 font-black text-lg">Total Pagado:</span>
                                    <span className="text-green-800 font-black text-2xl">${Number(modal.item?.total || 0).toLocaleString('es-CO')}</span>
                                </div>

                                <button onClick={() => setModal({ abierto: false, tipo: 'crear', item: null })} className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                                    Cerrar Ticket
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleGuardar} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                                {seccion === 'categorias' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre de la Categoría</label>
                                        <input name="nombre" defaultValue={modal.item?.nombre} placeholder="Ej. Frutas y Verduras" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                    </div>
                                )}

                                {seccion === 'inventario' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre del Producto</label>
                                            <input name="nombre" defaultValue={modal.item?.nombre} placeholder="Ej. Manzana" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                                                <input name="stock" type="number" min="0" defaultValue={modal.item?.stock} placeholder="0" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">Precio</label>
                                                <input name="precio" type="number" min="0" step="0.01" defaultValue={modal.item?.precio} placeholder="0.00" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Categoría</label>
                                            <select name="categoria_id" defaultValue={modal.item?.categoria_id || ''} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none bg-white" required>
                                                <option value="" disabled>Seleccione una categoría</option>
                                                {listaCategorias.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">URL de la Imagen</label>
                                            <input name="imagen_url" type="url" defaultValue={modal.item?.imagen_url} placeholder="https://ejemplo.com/imagen.jpg" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                        </div>
                                    </div>
                                )}

                                {seccion === 'usuarios' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">Nombre (Fijo)</label>
                                                <input type="text" defaultValue={modal.item?.nombre} disabled className="w-full p-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">Apellidos (Fijo)</label>
                                                <input type="text" defaultValue={modal.item?.apellidos} disabled className="w-full p-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed focus:outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Correo Electrónico</label>
                                            <input name="correo" type="email" defaultValue={modal.item?.correo} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</label>
                                            <input name="telefono" type="text" defaultValue={modal.item?.telefono} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Puntos Acumulados</label>
                                            <input name="puntos" type="number" min="0" defaultValue={modal.item?.puntos} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" required />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button type="submit" className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-sm">
                                        Guardar
                                    </button>
                                    <button type="button" onClick={() => setModal({ abierto: false, tipo: 'crear', item: null })} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
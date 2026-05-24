import { useState } from 'react';

export default function CheckoutPage({ cart, onBack, onConfirm }) {
  // Estados para segmentar la dirección de manera organizada
  const [barrio, setBarrio] = useState('');
  const [carrera, setCarrera] = useState('');
  const [calle, setCalle] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [metodoPago, setMetodoPago] = useState('Pago Contra Entrega');

  const total = cart.reduce((sum, item) => sum + Number(item.precio) * (item.cantidad || 1), 0);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const handleConfirmar = (e) => {
    e.preventDefault();

    if (!barrio.trim() || !numeroCasa.trim() || (!carrera.trim() && !calle.trim())) {
      alert("Por favor completa los datos básicos de envío (Barrio, Vía principal y # de casa).");
      return;
    }

    // Unificamos la dirección en una sola cadena limpia para guardar en la base de datos
    const partesDireccion = [];
    if (carrera.trim()) partesDireccion.push(`Carrera ${carrera.trim()}`);
    if (calle.trim()) partesDireccion.push(`Calle ${calle.trim()}`);
    partesDireccion.push(`#${numeroCasa.trim()}`);
    partesDireccion.push(`Barrio ${barrio.trim()}`);

    const direccionCompleta = partesDireccion.join(', ');

    // Enviamos el objeto con la dirección construida y el método de pago al backend
    onConfirm({
      direccion: direccionCompleta,
      metodoPago: metodoPago
    });
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <button onClick={onBack} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-semibold mb-4 flex items-center gap-2">
        ← Volver a la tienda
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Detalles de Envío y Pago</h2>
          
          <form onSubmit={handleConfirmar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Entrega</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input 
                    type="text" 
                    placeholder="Nombre del Barrio (Ej: 12 de Octubre)" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Carrera (Ej: 72)" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value)}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Calle (Ej: 81)" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={calle}
                    onChange={(e) => setCalle(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    type="text" 
                    placeholder="# de Casa / Apto / Interior (Ej: 19)" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={numeroCasa}
                    onChange={(e) => setNumeroCasa(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="Pago Contra Entrega">Pago Contra Entrega</option>
                <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white font-bold rounded-lg py-3 hover:bg-green-700 transition shadow-md mt-4">
              Confirmar Pedido ({formatearMoneda(total)})
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de tu pedido</h2>
          <div className="space-y-3 mb-6">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="font-semibold text-gray-800">{item.nombre}</span>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full ml-2">x{item.cantidad || 1}</span>
                </div>
                <span className="font-bold text-gray-800">{formatearMoneda(Number(item.precio) * (item.cantidad || 1))}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center font-black text-xl text-gray-800">
            <span>Total a pagar:</span>
            <span className="text-green-600">{formatearMoneda(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
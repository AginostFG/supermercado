export default function CheckoutPage({ cart, onBack, onConfirm }) {
  const total = cart.reduce((sum, item) => sum + item.precio, 0);

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
        {/* Formulario de envío y pago (Simulado) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Detalles de Envío y Pago</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Calle Falsa 123" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
              <option>Tarjeta de Crédito / Débito</option>
              <option>Pago Contra Entrega</option>
              <option>Transferencia Bancaria</option>
            </select>
          </div>

          <button onClick={onConfirm} className="w-full bg-green-600 text-white font-bold rounded-lg py-3 hover:bg-green-700 transition">
            Confirmar Pedido (${total.toFixed(2)})
          </button>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de tu pedido</h2>
          <div className="space-y-3 mb-6">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-gray-600">
                <span>{item.nombre}</span>
                <span className="font-semibold text-gray-800">${item.precio.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center font-black text-xl text-gray-800">
            <span>Total a pagar:</span>
            <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
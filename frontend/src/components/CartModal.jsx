export default function CartModal({ cart, onClose, onRemoveItem, onUpdateQuantity, onProceedToCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.precio * (item.cantidad || 1), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  // ✅ Función para formatear el dinero
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
        
        <h2 className="text-2xl font-bold mb-1 text-gray-800">Tu Carrito 🛒</h2>
        {cart.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">{totalItems} {totalItems === 1 ? 'producto' : 'productos'} añadidos</p>
        )}
        
        {cart.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-5xl mb-3">🛒</p>
            <p className="text-gray-500">Tu carrito está vacío.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.nombre}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {/* ✅ BOTONES DE + y - */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, (item.cantidad || 1) - 1, item.stock)}
                        disabled={(item.cantidad || 1) <= 1}
                        className="text-gray-500 hover:text-red-500 font-bold px-1 disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.cantidad || 1}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, (item.cantidad || 1) + 1, item.stock)}
                        disabled={(item.cantidad || 1) >= item.stock}
                        className="text-gray-500 hover:text-green-500 font-bold px-1 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm text-gray-600 font-medium bg-green-100 px-2 py-1 rounded-md">
                      {formatearMoneda(item.precio * (item.cantidad || 1))}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => onRemoveItem(index)}
                  className="text-red-400 hover:text-red-600 text-xl ml-3 p-2 bg-red-50 rounded-lg"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 flex justify-between items-center font-bold text-xl mb-6">
          <span>Total:</span>
          {/* ✅ Total Formateado */}
          <span className="text-green-600">{formatearMoneda(total)}</span>
        </div>

        <button 
          disabled={cart.length === 0}
          onClick={onProceedToCheckout}
          className="w-full bg-green-600 text-white font-bold rounded-xl py-4 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          Proceder al Pago
        </button>
      </div>
    </div>
  );
}
export default function CartModal({ cart, onClose, onRemoveItem, onProceedToCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.precio * (item.cantidad || 1), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      x{item.cantidad || 1}
                    </span>
                    <span className="text-sm text-gray-500">
                      ${(item.precio * (item.cantidad || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveItem(index)}
                  className="text-red-400 hover:text-red-600 text-xl ml-3"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4 flex justify-between items-center font-bold text-lg mb-4">
          <span>Total:</span>
          <span className="text-green-600">${total.toFixed(2)}</span>
        </div>

        <button 
          disabled={cart.length === 0}
          onClick={onProceedToCheckout}
          className="w-full bg-green-600 text-white font-bold rounded-lg py-3 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceder al Pago
        </button>
      </div>
    </div>
  );
}
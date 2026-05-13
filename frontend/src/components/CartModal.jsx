export default function CartModal({ cart, onClose, onRemoveItem, onProceedToCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.precio, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu Carrito 🛒</h2>
        
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Tu carrito está vacío.</p>
        ) : (
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-semibold">{item.nombre}</p>
                  <p className="text-sm text-gray-500">${item.precio.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => onRemoveItem(index)}
                  className="text-red-500 text-sm hover:underline font-medium"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4 flex justify-between items-center font-bold text-lg mb-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
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
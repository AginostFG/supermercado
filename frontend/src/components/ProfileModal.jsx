export default function ProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.nombre || 'Usuario Invitado'}</h2>
          <p className="text-gray-500 text-sm">{user?.correo || 'Sin correo registrado'}</p>
        </div>
        
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Rol:</span>
            <span className="capitalize font-semibold text-gray-800">{user?.rol || 'Cliente'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Puntos acumulados:</span>
            <span className="font-semibold text-yellow-600">0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Estado de la cuenta:</span>
            <span className="font-semibold text-green-600">Activa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
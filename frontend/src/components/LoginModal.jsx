import { useState } from 'react';

export default function LoginModal({ onClose, onLogin, onSwitchToRegister }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para manejar las notificaciones personalizadas integradas en la UI
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    try {
      const response = await fetch('https://supermercado-5759.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena: password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data));
        
        // Muestra saludo estético interno
        setMensajeExito(`¡Bienvenido de nuevo, ${data.nombre}! ✨`);

        // Espera 1.2 segundos para que el usuario disfrute la animación y luego redirige
        setTimeout(() => {
          const vista = data.rol_id === 2 ? 'admin' : 'cliente';
          onLogin(vista, data);
        }, 1200);

      } else {
        setMensajeError(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setMensajeError("El servidor no responde. Por favor, intenta más tarde.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl border border-gray-100">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold transition">✕</button>
        
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Iniciar Sesión</h2>
        
        {/* --- BANNER DE NOTIFICACIÓN DE ERROR --- */}
        {mensajeError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 animate-pulse">
            <span className="font-bold">⚠️</span>
            <p>{mensajeError}</p>
          </div>
        )}

        {/* --- BANNER DE NOTIFICACIÓN DE ÉXITO --- */}
        {mensajeExito && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2 font-semibold">
            <span className="text-base">🎉</span>
            <p>{mensajeExito}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="ejemplo@correo.com"
              disabled={mensajeExito !== ''} // Bloquea inputs si ya se inició sesión
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
              disabled={mensajeExito !== ''}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={mensajeExito !== ''}
            className={`w-full text-white font-bold rounded-lg py-3 transition shadow-md ${
              mensajeExito ? 'bg-emerald-600' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {mensajeExito ? 'Cargando panel...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 mb-2">¿Aún no tienes cuenta?</p>
          <button 
            onClick={onSwitchToRegister}
            disabled={mensajeExito !== ''}
            className="w-full border-2 border-green-600 text-green-600 font-bold rounded-lg py-2 hover:bg-green-50 transition standard-btn"
          >
            Regístrate ahora
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';

export default function LoginModal({ onClose, onLogin, onSwitchToRegister }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://supermercado-5759.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena: password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data));
        alert(`Bienvenido de nuevo, ${data.nombre}`);

        // ✅ Usa rol_id numérico para decidir la vista
        const vista = data.rol_id === 2 ? 'admin' : 'cliente';
        onLogin(vista, data);
      } else {
        alert(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("El servidor no responde.");
    }
  };

  return (
    // Agregamos backdrop-blur-md para difuminar el fondo
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="ejemplo@correo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="w-full bg-green-600 text-white font-bold rounded-lg py-3 hover:bg-green-700 transition">
            Entrar
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 mb-2">¿Aún no tienes cuenta?</p>
          <button 
            onClick={onSwitchToRegister}
            className="w-full border-2 border-green-600 text-green-600 font-bold rounded-lg py-2 hover:bg-green-50 transition"
          >
            Regístrate ahora
          </button>
        </div>
      </div>
    </div>
  );
}
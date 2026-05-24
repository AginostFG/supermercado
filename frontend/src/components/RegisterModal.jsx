import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Iconos para la contraseña

export default function RegisterModal({ onClose, onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    nombre: '', apellidos: '', correo: '', password: '', 
    confirmPassword: '', sexo: '', fechaNacimiento: '', telefono: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    onRegister(formData);
  };

  return (
    // Agregamos backdrop-blur-md aquí también
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl relative shadow-xl my-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Crear Cuenta</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s)</label>
            <input type="text" name="nombre" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
            <input type="text" name="apellidos" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="correo" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" name="telefono" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input type="date" name="fechaNacimiento" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <select name="sexo" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 bg-white">
              <option value="">Selecciona...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type={showPassword ? "text" : "password"} name="password" required minLength="6" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <input type={showPassword ? "text" : "password"} name="confirmPassword" required onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-green-600 text-white font-bold rounded-lg py-3 hover:bg-green-700 transition">
              Registrarse y Continuar
            </button>
          </div>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onSwitchToLogin} className="text-green-600 font-bold hover:underline">
            Inicia Sesión
          </button>
        </p>
      </div>
    </div>
  );
}
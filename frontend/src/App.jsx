import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import DashboardCliente from './pages/DashboardCliente';
import DashboardAdmin from './pages/DashboardAdmin';
import CheckoutPage from './pages/CheckoutPage';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CartModal from './components/CartModal';
import ProfileModal from './components/ProfileModal';

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ✅ Recuperar sesión al cargar usando rol_id numérico
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('usuario');
    if (sesionGuardada) {
      const datosUser = JSON.parse(sesionGuardada);
      setUser(datosUser);
      setView(datosUser.rol_id === 2 ? 'admin' : 'cliente');
    }
  }, []);

  // ✅ handleLogin también guarda en localStorage por si acaso
  const handleLogin = (role, userData) => {
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUser(userData);
    setView(role);
    setIsLoginOpen(false);
  };

  const handleRegister = async (userData) => {
    try {
      const response = await fetch('https://supermercado-5759.onrender.com/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          contrasena: userData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Registro siempre devuelve rol_id: 1 (cliente)
        const usuarioCompleto = { ...data, rol_id: 1 };
        localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
        setUser(usuarioCompleto);
        setView('cliente');
        setIsRegisterOpen(false);
        alert("¡Registro exitoso!");
      } else {
        alert(data.error || "Error al registrar");
      }
    } catch (error) {
      console.error("Error conectando al backend:", error);
      alert("Error: El servidor backend no responde.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUser(null);
    setCart([]);
    setView('landing');
  };

  const addToCart = (producto) => {
    setCart((prevCart) => {
      const itemsActuales = Array.isArray(prevCart) ? prevCart : [];
      const existe = itemsActuales.find(item => item.id === producto.id);

      if (existe) {
        return itemsActuales.map(item =>
          item.id === producto.id ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item
        );
      }

      return [...itemsActuales, { ...producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (indexToRemove) => {
    setCart(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const goToCheckout = () => {
    setIsCartOpen(false);
    setView('checkout');
  };

  const processPayment = () => {
    alert("¡Pago exitoso!");
    setCart([]);
    setView('cliente');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white shadow-sm p-4 px-6 flex justify-between items-center sticky top-0 z-40">
        <div
          className="text-2xl font-black text-green-600 cursor-pointer"
          onClick={() => view === 'landing' ? null : setView(user?.rol_id === 2 ? 'admin' : 'cliente')}
        >
          SuperPro
        </div>

        {view === 'landing' ? (
          <div className="flex gap-3">
            <button onClick={() => setIsLoginOpen(true)} className="text-green-600 font-semibold hover:text-green-700 px-4 py-2">Iniciar Sesión</button>
            <button onClick={() => setIsRegisterOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm">Registrarse</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {view === 'cliente' && (
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-green-100 rounded-full text-green-700">
                🛒 {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((acc, item) => acc + (item.cantidad || 1), 0)}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setIsProfileOpen(true)} className="p-2 bg-blue-100 rounded-full text-blue-700">👤</button>
            <button onClick={handleLogout} className="text-sm font-semibold text-gray-600 ml-2 border-l pl-4 border-gray-300 hover:text-red-500">Salir</button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {view === 'landing' && <LandingPage onOpenLogin={() => setIsLoginOpen(true)} onOpenRegister={() => setIsRegisterOpen(true)} />}
        {view === 'cliente' && <DashboardCliente onAddToCart={addToCart} onLogout={handleLogout} />}
        {view === 'admin' && <DashboardAdmin />}
        {view === 'checkout' && <CheckoutPage cart={cart} onBack={() => setView('cliente')} onConfirm={processPayment} />}
      </main>

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} />}
      {isRegisterOpen && <RegisterModal onClose={() => setIsRegisterOpen(false)} onRegister={handleRegister} onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} />}
      {isCartOpen && <CartModal cart={cart} onClose={() => setIsCartOpen(false)} onRemoveItem={removeFromCart} onProceedToCheckout={goToCheckout} />}
      {isProfileOpen && <ProfileModal user={user} onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}
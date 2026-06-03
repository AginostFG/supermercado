import { useState, useEffect } from 'react';
// 1. Importamos la librería de Toasts y sus estilos
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('usuario');
    if (sesionGuardada) {
      const datosUser = JSON.parse(sesionGuardada);
      setUser(datosUser);
      setView(datosUser.rol_id === 2 ? 'admin' : 'cliente');
    }
  }, []);

  const handleLogin = (role, userData) => {
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUser(userData);
    setView(role);
    setIsLoginOpen(false);
    toast.success(`¡Bienvenido de nuevo, ${userData.nombre || 'Usuario'}! 👋`);
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
        const usuarioCompleto = { ...data, rol_id: 1 };
        localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
        setUser(usuarioCompleto);
        setView('cliente');
        setIsRegisterOpen(false);
        toast.success("¡Registro exitoso! 🎉 Bienvenido a SuperPro.");
      } else {
        toast.error(data.error || "Error al registrar el usuario. ❌");
      }
    } catch (error) {
      console.error("Error conectando al backend:", error);
      toast.error("Error: El servidor backend no responde. 🔌");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUser(null);
    setCart([]);
    setView('landing');
    toast.info("Has cerrado sesión correctamente. ¡Vuelve pronto!");
  };

  const addToCart = (producto) => {
    if (!user) {
      toast.warn("Debes iniciar sesión para comprar productos. 🔑");
      setIsLoginOpen(true);
      return;
    }

    setCart((prevCart) => {
      const itemsActuales = Array.isArray(prevCart) ? prevCart : [];
      const existe = itemsActuales.find(item => item.id === producto.id);

      if (existe) {
        if (existe.cantidad >= producto.stock) {
          toast.error(`¡Límite alcanzado! Solo quedan ${producto.stock} unidades disponibles.`);
          return prevCart;
        }
        toast.success(`Se añadió otra unidad de ${producto.nombre} 🛒`);
        return itemsActuales.map(item =>
          item.id === producto.id ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item
        );
      }

      toast.success(`${producto.nombre} agregado al carrito 🛒`);
      return [...itemsActuales, { ...producto, cantidad: 1 }];
    });
  };

  const updateCartQuantity = (productoId, nuevaCantidad, stockDisponible) => {
    if (nuevaCantidad > stockDisponible) {
      toast.warn(`¡Límite alcanzado! Solo quedan ${stockDisponible} unidades.`);
      return;
    }
    if (nuevaCantidad < 1) return;

    setCart(prevCart => prevCart.map(item => 
      item.id === productoId ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const removeFromCart = (indexToRemove) => {
    const itemEliminado = cart[indexToRemove];
    setCart(prev => prev.filter((_, index) => index !== indexToRemove));
    if (itemEliminado) toast.info(`${itemEliminado.nombre} eliminado del carrito.`);
  };

  const goToCheckout = () => {
    setIsCartOpen(false);
    setView('checkout');
  };

  const processPayment = async (datosCheckout) => {
    try {
      const response = await fetch('https://supermercado-5759.onrender.com/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cart, 
          usuario_id: user?.id,
          direccion: datosCheckout.direccion,
          metodoPago: datosCheckout.metodoPago
        }) 
      });

      if (response.ok) {
        toast.success("¡Pago exitoso! Hemos registrado tu compra y actualizado el inventario. 💳✨");
        setCart([]);
        setView('cliente');
      } else {
        toast.error("Hubo un error procesando tu compra. Intenta de nuevo. 😥");
      }
    } catch (error) {
      console.error("Error en la compra:", error);
      toast.error("Error al conectar con el servidor. Intentelo más tarde.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Contenedor Global de Notificaciones Flotantes */}
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

      <nav className="bg-white shadow-sm p-4 px-6 flex justify-between items-center sticky top-0 z-40">
        <div
          className="text-2xl font-black text-green-600 cursor-pointer"
          onClick={() => setView(user ? (user.rol_id === 2 ? 'admin' : 'cliente') : 'landing')}
        >
          SuperPro
        </div>

        {!user ? (
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
        {view === 'landing' && <LandingPage onGoToStore={() => setView('cliente')} />}
        {view === 'cliente' && <DashboardCliente onAddToCart={addToCart} />}
        {view === 'admin' && <DashboardAdmin />}
        {view === 'checkout' && <CheckoutPage cart={cart} onBack={() => setView('cliente')} onConfirm={processPayment} />}
      </main>

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} />}
      {isRegisterOpen && <RegisterModal onClose={() => setIsRegisterOpen(false)} onRegister={handleRegister} onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} />}
      {isCartOpen && <CartModal cart={cart} onClose={() => setIsCartOpen(false)} onRemoveItem={removeFromCart} onUpdateQuantity={updateCartQuantity} onProceedToCheckout={goToCheckout} />}
      {isProfileOpen && <ProfileModal user={user} onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}
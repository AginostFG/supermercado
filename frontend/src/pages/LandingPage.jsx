export default function LandingPage({ onOpenLogin, onOpenRegister }) {
  return (
    <div
      className="relative text-center py-32 rounded-3xl overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Capa semitransparente */}
      <div className="absolute inset-0 bg-white/40 rounded-3xl" />

      {/* Contenido encima */}
      <div className="relative z-10">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Tu Supermercado <span className="text-green-600">Pro</span>
        </h1>
        <p className="text-xl text-black-600 mb-8">Frescura y calidad a un clic de distancia.</p>
        <button
          onClick={onOpenLogin}
          className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg"
        >
          Empezar a comprar
        </button>
      </div>
    </div>
  );
}
export default function LandingPage({ onGoToStore }) {
  return (
    <div
      className="relative text-center py-32 rounded-3xl overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Capa semitransparente oscura para bajar el brillo al fondo */}
      <div className="absolute inset-0 bg-black/60 rounded-3xl backdrop-blur-sm" />

      {/* Contenido encima */}
      <div className="relative z-10">
        <h1 className="text-6xl font-black text-white mb-4">
          Tu supermercado <span className="text-green-500">Pro</span>
        </h1>
        <p className="text-2xl font-bold text-gray-200 mb-8">
          Frescura y calidad a un clic de distancia.
        </p>
        <button
          onClick={onGoToStore}
          className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg"
        >
          Empezar a comprar
        </button>
      </div>
    </div>
  );
}
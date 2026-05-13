export default function LandingPage({ onOpenLogin }) {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Tu Supermercado <span className="text-green-600">Pro</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8">Frescura y calidad a un clic de distancia.</p>
      <button 
        onClick={onOpenLogin}
        className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-lg"
      >
        Empezar a comprar
      </button>
    </div>
  );
}
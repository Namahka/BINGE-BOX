import { useFavorites } from "../context/FavoritesContext.jsx";
import MovieCard from "../components/MovieCard.jsx";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-400 text-center mb-8">
        Mina favoriter
      </h1>

      {favorites.length === 0 ? (
        <p className="text-center text-gray-400">Inga favoriter ännu.</p>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favorites.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}

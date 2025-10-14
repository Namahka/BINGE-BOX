import { useFavorites } from "../context/FavoritesContext";
import MovieCard from "../components/MovieCard";

export default function Favorites() {
  const { favorites, loading } = useFavorites();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <MovieCard
              key={m.movieId}
              movie={{
                id: m.movieId,
                title: m.title,
                posterUrl: m.posterUrl,
                rating: m.rating,
                genre: m.genre,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { getFavorites } from "../api"; // 👈 den nya API-funktionen
import MovieCard from "../components/MovieCard";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        const data = await getFavorites();
        setFavorites(data);
      } catch (err) {
        console.error("⚠️ Fel vid hämtning av favoriter:", err);
        setError("Kunde inte hämta favoriter – är du inloggad?");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  if (loading)
    return (
      <p className="text-center text-yellow-400 mt-10">Laddar favoriter...</p>
    );

  if (error)
    return <p className="text-center text-red-400 mt-10">{error}</p>;

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
            <MovieCard key={m.movieId} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovie() {
      try {
        // === HÄMTA DATA FRÅN BACKEND ===
        const res = await fetch(`https://localhost:7299/api/tmdb/movie/${id}`);
        const text = await res.text(); // fånga rådata innan JSON
        console.log("🧩 RAW RESPONSE:", text);

        // om API:t returnerar tomt eller felaktigt
        if (!text || text.trim() === "") {
          throw new Error("Tomt svar från servern");
        }

        const data = JSON.parse(text);
        console.log("🎬 Parsed data:", data);

        setMovie(data);
      } catch (err) {
        console.error("❌ Fel vid hämtning:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [id]);

  if (loading)
    return <p className="text-center text-slate-400 mt-10">Laddar...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!movie) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Tillbaka-knapp */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded"
      >
        ← Tillbaka
      </button>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-1/3">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{movie.title}</h1>

          {/* === TRAILER === */}
          {(movie.trailer || movie.trailerUrl) && (
            <div className="w-full aspect-video mb-6">
              <iframe
                src={movie.trailer || movie.trailerUrl}
                title="Trailer"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-lg border border-slate-700"
              ></iframe>
            </div>
          )}

          {/* Beskrivning */}
          <p className="text-slate-300 mb-4 leading-relaxed">
            {movie.overview}
          </p>

          {/* Metadata */}
          <p className="text-slate-400 mb-2">
            Betyg:{" "}
            <span className="text-yellow-400">
              {movie.rating?.toFixed(1) || "N/A"}
            </span>
          </p>

          <p className="text-slate-400 mb-4">
            Releasedatum: {movie.releaseDate || "Okänt"}
          </p>

          {movie.genres?.length > 0 && (
            <p className="text-sm text-slate-400 mb-6">
              Genre:{" "}
              <span className="text-slate-200">
                {movie.genres.join(", ")}
              </span>
            </p>
          )}

          {/* === CAST === */}
          <h2 className="text-xl font-semibold mb-2">Skådespelare</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {movie.cast?.map((actor) => (
              <div key={actor.id} className="text-center">
                {actor.profile ? (
                  <img
                    src={actor.profile}
                    alt={actor.name}
                    onClick={() => navigate(`/person/${actor.id}`)}
                    className="w-24 h-24 object-cover rounded-full mx-auto mb-2 cursor-pointer hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-700 mx-auto mb-2" />
                )}
                <p className="text-sm text-white">{actor.name}</p>
                <p className="text-xs text-slate-400">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

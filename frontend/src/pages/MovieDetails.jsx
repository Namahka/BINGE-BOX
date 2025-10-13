import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetails() {
  const { id, type } = useParams(); // 👈 får både id & type (movie / tv)
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧩 Hämta detaljer för rätt typ
  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`https://localhost:7299/api/tmdb/details/${type}/${id}`);
        if (!res.ok) throw new Error(`Kunde inte hämta ${type}-detaljer (${res.status})`);

        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("❌ Fel vid hämtning:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id, type]);

  // 🌀 Statusvisning
  if (loading)
    return <p className="text-center text-slate-400 mt-10">Laddar...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!movie)
    return <p className="text-center text-gray-400 mt-10">Ingen data hittades.</p>;

  // 🎨 UI
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
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
              Ingen bild
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{movie.title}</h1>

          {/* 🎞 Trailer */}
          {movie.trailer ? (
            <div className="w-full aspect-video mb-6">
              <iframe
                src={movie.trailer.replace("watch?v=", "embed/")}
                title="Trailer"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-lg border border-slate-700"
              ></iframe>
            </div>
          ) : (
            <p className="text-slate-500 mb-4">Ingen trailer tillgänglig.</p>
          )}

          {/* 🧾 Beskrivning */}
          <p className="text-slate-300 mb-4 leading-relaxed">
            {movie.overview || "Ingen beskrivning tillgänglig."}
          </p>

          {/* ⭐ Metadata */}
          <p className="text-slate-400 mb-2">
            Betyg:{" "}
            <span className="text-yellow-400">
              {movie.rating?.toFixed(1) || "N/A"}
            </span>
          </p>

          <p className="text-slate-400 mb-4">
            {type === "tv" ? "Första sändning:" : "Releasedatum:"}{" "}
            {movie.releaseDate || "Okänt"}
          </p>

          {/* 👥 Cast */}
          <h2 className="text-xl font-semibold mb-2">Skådespelare</h2>
          {movie.cast?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {movie.cast.map((actor) => (
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
          ) : (
            <p className="text-slate-500">Ingen skådespelarinfo tillgänglig.</p>
          )}
        </div>
      </div>
    </div>
  );
}
